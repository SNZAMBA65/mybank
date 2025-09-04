<?php

namespace App\Controller;

use App\Entity\Operation;
use App\Repository\OperationRepository;
use App\Repository\CategoryRepository;
use App\Repository\UserRepository;
use App\Repository\AccountRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use DateTime;

/**
 * Operation Controller
 * 
 * Manages CRUD operations for financial transactions (operations)
 * Handles creation, reading, updating, and deletion of operations
 * Automatically manages account balance updates based on operations
 */
#[Route('/api/operations')]
class OperationController extends AbstractController
{
    /**
     * Get all operations
     * 
     * Retrieves a list of all operations in the system
     * 
     * @param OperationRepository $operationRepository Repository for operation data access
     * @return JsonResponse JSON response containing all operations
     */
    #[Route('', name: 'api_operations_index', methods: ['GET'])]
    public function index(OperationRepository $operationRepository): JsonResponse
    {
        // Fetch all operations from the database
        $operations = $operationRepository->findAll();
        
        // Return operations as JSON with read serialization group
        return $this->json($operations, Response::HTTP_OK, [], [
            'groups' => ['operation:read']
        ]);
    }

    /**
     * Get a specific operation by ID
     * 
     * Retrieves details of a single operation
     * 
     * @param Operation $operation The operation entity (automatically resolved by Symfony)
     * @return JsonResponse JSON response containing the operation details
     */
    #[Route('/{id}', name: 'api_operations_show', methods: ['GET'])]
    public function show(Operation $operation): JsonResponse
    {
        // Return the operation as JSON with read serialization group
        return $this->json($operation, Response::HTTP_OK, [], [
            'groups' => ['operation:read']
        ]);
    }

    /**
     * Create a new operation
     * 
     * Creates a new financial operation and updates the associated account balance
     * If no date is provided, uses current timestamp
     * If date is provided, combines it with current time for precise timestamping
     * 
     * @param Request $request HTTP request containing operation data
     * @param CategoryRepository $categoryRepository Repository for category data access
     * @param UserRepository $userRepository Repository for user data access
     * @param AccountRepository $accountRepository Repository for account data access
     * @param EntityManagerInterface $entityManager Doctrine entity manager for database operations
     * @return JsonResponse JSON response containing the created operation or error message
     */
    #[Route('', name: 'api_operation_create', methods: ['POST'])]
    public function create(
        Request $request, 
        CategoryRepository $categoryRepository,
        UserRepository $userRepository,
        AccountRepository $accountRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Decode JSON request body
        $data = json_decode($request->getContent(), true);
        
        // Validate JSON data
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON data'], Response::HTTP_BAD_REQUEST);
        }

        // Initialize new operation entity
        $operation = new Operation();

        // Set operation label with fallback default
        $operation->setLabel($data['label'] ?? 'New operation');
        
        // Set operation amount with fallback default (negative for expense)
        $operation->setAmount($data['amount'] ?? '-10.00');

        // Handle date setting with precise timestamp
        if (!isset($data['date']) || empty($data['date'])) {
            // No date provided - use current timestamp
            $operation->setDate(new \DateTime());
        } else {
            // Date provided - combine with current time for precise timestamping
            $date = new \DateTime($data['date']);
            $now = new \DateTime();
            $date->setTime($now->format('H'), $now->format('i'), $now->format('s'));
            $operation->setDate($date);
        }

        // Handle category assignment
        $categoryId = $data['categoryId'] ?? 8; // Default category ID
        $category = $categoryRepository->find($categoryId);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }
        $operation->setCategory($category);

        // Handle user assignment - get first available user
        $user = $userRepository->findOneBy([]);
        if (!$user) {
            return $this->json(['error' => 'No user found'], Response::HTTP_NOT_FOUND);
        }
        $operation->setUser($user);

        // Handle account assignment
        $accountId = $data['accountId'] ?? null;
        $account = null;
        
        if ($accountId) {
            // Specific account requested
            $account = $accountRepository->find($accountId);
            if (!$account) {
                return $this->json(['error' => 'Account not found'], Response::HTTP_NOT_FOUND);
            }
        } else {
            // No account specified - use user's first account
            if ($user && $user->getAccounts()->count() > 0) {
                $account = $user->getAccounts()->first();
            }
        }

        // Assign account to operation if available
        if ($account) {
            $operation->setAccount($account);
        }

        // Persist operation to database
        $entityManager->persist($operation);
        
        // Update account balance if account is assigned
        if ($account) {
            $currentBalance = floatval($account->getBalance());
            $operationAmount = floatval($data['amount'] ?? '-10.00');
            $newBalance = $currentBalance + $operationAmount;
            $account->setBalance(strval($newBalance));
        }

        // Save all changes to database
        $entityManager->flush();

        // Return created operation with 201 status code
        return $this->json($operation, Response::HTTP_CREATED, [], [
            'groups' => ['operation:read']
        ]);
    }

    /**
     * Update an existing operation
     * 
     * Updates operation details and recalculates account balances
     * First reverses the old operation's impact on account balance,
     * then applies the new operation values
     * FIXED: Preserve time information when updating dates
     * 
     * @param Request $request HTTP request containing updated operation data
     * @param Operation $operation The operation to update (automatically resolved by Symfony)
     * @param CategoryRepository $categoryRepository Repository for category data access
     * @param AccountRepository $accountRepository Repository for account data access
     * @param EntityManagerInterface $entityManager Doctrine entity manager for database operations
     * @return JsonResponse JSON response containing the updated operation or error message
     */
    #[Route('/{id}', name: 'api_operations_update', methods: ['PUT'])]
    public function update(
        Request $request, 
        Operation $operation,
        CategoryRepository $categoryRepository,
        AccountRepository $accountRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Decode JSON request body
        $data = json_decode($request->getContent(), true);
        
        // Validate JSON data
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON data'], Response::HTTP_BAD_REQUEST);
        }

        // DEBUG: Log the received date data
        if (isset($data['date'])) {
            error_log('UPDATE: Received date from frontend: ' . $data['date']);
            error_log('UPDATE: Original operation date: ' . $operation->getDate()->format('Y-m-d H:i:s'));
        }

        // Reverse the old operation's impact on account balance
        $oldAccount = $operation->getAccount();
        if ($oldAccount) {
            $currentBalance = floatval($oldAccount->getBalance());
            $oldAmount = floatval($operation->getAmount());
            // Subtract old amount to restore previous balance
            $restoredBalance = $currentBalance - $oldAmount;
            $oldAccount->setBalance(strval($restoredBalance));
        }

        // Update operation label if provided
        if (isset($data['label'])) {
            $operation->setLabel($data['label']);
        }
        
        // Update operation amount if provided
        if (isset($data['amount'])) {
            $operation->setAmount($data['amount']);
        }
        
        // FIXED: Update operation date with time preservation
        if (isset($data['date'])) {
            try {
                // Try to create DateTime from received data
                $newDateTime = new DateTime($data['date']);
                
                // DEBUG: Log what we created
                error_log('UPDATE: Created DateTime object: ' . $newDateTime->format('Y-m-d H:i:s'));
                
                // Check if the received date has time information
                $dateString = $data['date'];
                
                // If the date string contains 'T' it likely has time info
                if (strpos($dateString, 'T') !== false) {
                    // Full datetime received, use as-is
                    error_log('UPDATE: Full datetime received, using as-is');
                    $operation->setDate($newDateTime);
                } else {
                    // Only date received, preserve original time
                    error_log('UPDATE: Only date received, preserving original time');
                    $originalTime = $operation->getDate();
                    $newDateTime->setTime(
                        $originalTime->format('H'),
                        $originalTime->format('i'),
                        $originalTime->format('s')
                    );
                    $operation->setDate($newDateTime);
                }
                
                // DEBUG: Log final result
                error_log('UPDATE: Final operation date set to: ' . $operation->getDate()->format('Y-m-d H:i:s'));
                
            } catch (\Exception $e) {
                error_log('UPDATE: Error parsing date: ' . $e->getMessage());
                return $this->json(['error' => 'Invalid date format'], Response::HTTP_BAD_REQUEST);
            }
        }
        
        // Update category if provided
        if (isset($data['categoryId'])) {
            $category = $categoryRepository->find($data['categoryId']);
            if (!$category) {
                return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
            }
            $operation->setCategory($category);
        }

        // Update account if provided
        if (isset($data['accountId'])) {
            $account = $accountRepository->find($data['accountId']);
            if (!$account) {
                return $this->json(['error' => 'Account not found'], Response::HTTP_NOT_FOUND);
            }
            $operation->setAccount($account);
        }

        // Apply the updated operation to the (possibly new) account balance
        $newAccount = $operation->getAccount();
        if ($newAccount) {
            $currentBalance = floatval($newAccount->getBalance());
            $newAmount = floatval($operation->getAmount());
            // Add new amount to current balance
            $updatedBalance = $currentBalance + $newAmount;
            $newAccount->setBalance(strval($updatedBalance));
        }

        // Save all changes to database
        $entityManager->flush();


        // Return updated operation
        return $this->json($operation, Response::HTTP_OK, [], [
            'groups' => ['operation:read']
        ]);
    }

    /**
     * Delete an operation
     * 
     * Removes an operation from the system and restores the account balance
     * by reversing the operation's impact
     * 
     * @param Operation $operation The operation to delete (automatically resolved by Symfony)
     * @param EntityManagerInterface $entityManager Doctrine entity manager for database operations
     * @return JsonResponse JSON response confirming deletion
     */
    #[Route('/{id}', name: 'api_operations_delete', methods: ['DELETE'])]
    public function delete(Operation $operation, EntityManagerInterface $entityManager): JsonResponse
    {
        // Restore account balance before deletion
        $account = $operation->getAccount();
        if ($account) {
            $currentBalance = floatval($account->getBalance());
            $operationAmount = floatval($operation->getAmount());
            // Subtract operation amount to restore balance as if operation never existed
            $restoredBalance = $currentBalance - $operationAmount;
            $account->setBalance(strval($restoredBalance));
        }

        // Remove operation from database
        $entityManager->remove($operation);
        
        // Save changes to database
        $entityManager->flush();

        // Return success confirmation
        return $this->json(['message' => 'Operation deleted successfully'], Response::HTTP_OK);
    }
}
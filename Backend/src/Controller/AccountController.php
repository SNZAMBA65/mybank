<?php


namespace App\Controller;

use App\Entity\Account;
use App\Entity\User;
use App\Repository\AccountRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/accounts')]
class AccountController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'api_accounts_index', methods: ['GET'])]
    public function index(AccountRepository $accountRepository): JsonResponse
    {
        $accounts = $accountRepository->findAll();
        
        return $this->json($accounts, Response::HTTP_OK, [], [
            'groups' => ['account:read']
        ]);
    }

    #[Route('/{id}', name: 'api_accounts_show', methods: ['GET'])]
    public function show(Account $account): JsonResponse
    {
        return $this->json($account, Response::HTTP_OK, [], [
            'groups' => ['account:read']
        ]);
    }

    #[Route('', name: 'api_accounts_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data || !isset($data['name']) || !isset($data['type'])) {
            return $this->json([
                'error' => 'Name and type are required'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Utiliser l'utilisateur connecté
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'No user found'], Response::HTTP_NOT_FOUND);
        }

        $account = new Account();
        $account->setName($data['name']);
        $account->setType($data['type']);
        $account->setBalance($data['balance'] ?? '0.00');
        $account->setCurrency($data['currency'] ?? 'EUR');
        $account->setAccountNumber($this->generateAccountNumber());
        $account->setUser($user);

        // Validation
        $errors = $this->validator->validate($account);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($account);
        $this->entityManager->flush();

        return $this->json($account, Response::HTTP_CREATED, [], [
            'groups' => ['account:read']
        ]);
    }

    #[Route('/{id}', name: 'api_accounts_update', methods: ['PUT'])]
    public function update(Request $request, Account $account): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON data'], Response::HTTP_BAD_REQUEST);
        }

        if (isset($data['name'])) {
            $account->setName($data['name']);
        }
        
        if (isset($data['type'])) {
            $account->setType($data['type']);
        }
        
        if (isset($data['balance'])) {
            $account->setBalance($data['balance']);
        }

        // Validation
        $errors = $this->validator->validate($account);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json($account, Response::HTTP_OK, [], [
            'groups' => ['account:read']
        ]);
    }

    #[Route('/{id}', name: 'api_accounts_delete', methods: ['DELETE'])]
    public function delete(Account $account): JsonResponse
    {
        $this->entityManager->remove($account);
        $this->entityManager->flush();

        return $this->json(['message' => 'Account deleted successfully'], Response::HTTP_OK);
    }

    #[Route('/user/{id}', name: 'api_accounts_by_user', methods: ['GET'])]
    public function getAccountsByUser(User $user): JsonResponse
    {
        $accounts = $user->getAccounts();
        
        return $this->json($accounts, Response::HTTP_OK, [], [
            'groups' => ['account:read']
        ]);
    }

    private function generateAccountNumber(): string
    {
        return 'FR76' . str_pad(mt_rand(0, 9999999999999999), 16, '0', STR_PAD_LEFT);
    }
}
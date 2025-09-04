<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Authentication Controller
 * 
 * Handles all authentication-related operations including:
 * - User registration with validation and password hashing
 * - User login with credential verification
 * - Password change with current password validation
 * - User profile retrieval
 * 
 * All responses are in JSON format with appropriate HTTP status codes
 * Comprehensive error handling and security logging included
 */
#[Route('/api/auth')]
class AuthController extends AbstractController
{
    /**
     * Constructor with dependency injection
     * 
     * @param EntityManagerInterface $entityManager Doctrine entity manager for database operations
     * @param UserPasswordHasherInterface $passwordHasher Service for secure password hashing
     * @param ValidatorInterface $validator Service for entity validation
     */
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator
    ) {}

    /**
     * Register a new user account
     * 
     * Creates a new user with provided credentials, validates input data,
     * hashes password securely, and persists to database
     * 
     * @param Request $request HTTP request containing user registration data
     * @return JsonResponse JSON response with success message or error details
     */
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        try {
            // Decode JSON request body
            $data = json_decode($request->getContent(), true);

            // Validate required fields
            if (!$data || !isset($data['email']) || !isset($data['password']) || !isset($data['firstName']) || !isset($data['lastName'])) {
                return $this->json([
                    'error' => 'Email, password, firstName and lastName are required'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Create new user entity
            $user = new User();
            $user->setEmail($data['email']);
            $user->setFirstName($data['firstName']);
            $user->setLastName($data['lastName']);
            $user->setRoles(['ROLE_USER']); // Assign default user role

            // Hash password securely using Symfony's password hasher
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);

            // Validate user entity against constraints
            $errors = $this->validator->validate($user);
            if (count($errors) > 0) {
                return $this->json(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
            }

            // Persist user to database
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            // Return success response with user data (excluding sensitive information)
            return $this->json([
                'message' => 'User created successfully',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName()
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            // Log error for debugging (server-side only)
            error_log('Register error: ' . $e->getMessage());
            
            // Return generic error message to client (security best practice)
            return $this->json([
                'error' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Authenticate user login
     * 
     * Verifies user credentials, validates password, and returns user information
     * Includes comprehensive security logging for monitoring
     * 
     * @param Request $request HTTP request containing login credentials
     * @param UserRepository $userRepository Repository for user data access
     * @return JsonResponse JSON response with user data or error message
     */
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request, UserRepository $userRepository): JsonResponse
    {
        try {
            // Decode JSON request body
            $data = json_decode($request->getContent(), true);

            // Validate required fields
            if (!$data || !isset($data['email']) || !isset($data['password'])) {
                return $this->json([
                    'error' => 'Email and password are required'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Secure debug logging: log only email (never password)
            error_log('Login attempt for email: ' . $data['email']);

            // Find user by email
            $user = $userRepository->findOneBy(['email' => $data['email']]);

            // Secure debug logging: confirm user existence without exposing data
            error_log('User found: ' . ($user ? 'YES (ID: ' . $user->getId() . ')' : 'NO'));

            // Check if user exists and has a password set
            if (!$user || !$user->getPassword()) {
                error_log('Login failed: User not found or no password');
                return $this->json([
                    'error' => 'Invalid credentials'
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Verify password using secure hash comparison
            error_log('Password verification attempt...');
            if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
                error_log('Login failed: Invalid password');
                return $this->json([
                    'error' => 'Invalid credentials'
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Log successful authentication
            error_log('Login successful for user ID: ' . $user->getId());
            
            // Return success response with user data (excluding sensitive information)
            return $this->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName()
                ]
            ]);

        } catch (\Exception $e) {
            // Log error for debugging (server-side only)
            error_log('Login error: ' . $e->getMessage());
            
            // Return generic error message to client (security best practice)
            return $this->json([
                'error' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Change user password
     * 
     * Validates current password, applies new password requirements,
     * and updates user password with secure hashing
     * 
     * @param Request $request HTTP request containing password change data
     * @param UserRepository $userRepository Repository for user data access
     * @return JsonResponse JSON response confirming password change or error
     */
    #[Route('/change-password', name: 'api_change_password', methods: ['POST'])]
    public function changePassword(Request $request, UserRepository $userRepository): JsonResponse
    {
        try {
            // Decode JSON request body
            $data = json_decode($request->getContent(), true);

            // Validate required fields
            if (!isset($data['email']) || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
                return $this->json([
                    'error' => 'Email, current password and new password are required'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Log password change attempt (secure: email only)
            error_log('Password change attempt for email: ' . $data['email']);

            // Find user by email
            $user = $userRepository->findOneBy(['email' => $data['email']]);
            
            // Verify user exists and current password is correct
            if (!$user || !$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
                error_log('Password change failed: Invalid current password');
                return $this->json([
                    'error' => 'Current password is incorrect'
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Validate new password requirements
            if (strlen($data['newPassword']) < 6) {
                return $this->json([
                    'error' => 'New password must be at least 6 characters long'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Hash new password securely
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
            $user->setPassword($hashedPassword);

            // Save changes to database
            $this->entityManager->flush();

            // Log successful password change
            error_log('Password changed successfully for user ID: ' . $user->getId());

            // Return success confirmation
            return $this->json([
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            // Log error for debugging (server-side only)
            error_log('Change password error: ' . $e->getMessage());
            
            // Return generic error message to client (security best practice)
            return $this->json([
                'error' => 'Internal Server Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get current user information
     * 
     * Returns the authenticated user's profile data
     * Currently returns demo/mock data - should be updated to return actual user data
     * based on authentication token/session
     * 
     * @return JsonResponse JSON response containing user profile data
     */
    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        // TODO: Replace with actual authenticated user data from token/session
        // This is demo data for development purposes
        return $this->json([
            'id' => 1,
            'email' => 'test@mybank.com',
            'firstName' => 'John',
            'lastName' => 'Doe'
        ]);
    }
}
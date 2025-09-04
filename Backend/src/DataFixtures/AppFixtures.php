<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Account;
use App\Entity\Category;
use App\Entity\Operation;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use DateTime;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        // Créer un utilisateur de test
        $user = new User();
        $user->setEmail('test@mybank.com');
        $user->setFirstName('John');
        $user->setLastName('Doe');
        $user->setRoles(['ROLE_USER']);
        
        $hashedPassword = $this->passwordHasher->hashPassword($user, 'password123');
        $user->setPassword($hashedPassword);
        
        $manager->persist($user);

        // Créer des comptes réels
        $accounts = [
            [
                'name' => 'Compte Courant',
                'type' => 'checking',
                'balance' => '2845.67',
                'accountNumber' => 'FR7630001007941234567890185'
            ],
            [
                'name' => 'Livret A',
                'type' => 'savings',
                'balance' => '8450.00',
                'accountNumber' => 'FR7630001007941234567890186'
            ],
            [
                'name' => 'Compte Épargne',
                'type' => 'savings',
                'balance' => '1250.30',
                'accountNumber' => 'FR7630001007941234567890187'
            ]
        ];

        $accountObjects = [];
        foreach ($accounts as $accountData) {
            $account = new Account();
            $account->setName($accountData['name']);
            $account->setType($accountData['type']);
            $account->setBalance($accountData['balance']);
            $account->setCurrency('EUR');
            $account->setAccountNumber($accountData['accountNumber']);
            $account->setUser($user);
            
            $manager->persist($account);
            $accountObjects[] = $account;
        }

        // Créer des catégories de test
        $categories = [
            'Alimentation',
            'Transport',
            'Loisirs',
            'Logement',
            'Santé',
            'Shopping',
            'Salaire',
            'Autres'
        ];

        $categoryObjects = [];
        foreach ($categories as $categoryName) {
            $category = new Category();
            $category->setTitle($categoryName);
            $manager->persist($category);
            $categoryObjects[] = $category;
        }

        // Créer des opérations de test liées aux comptes réels
        $operations = [
            ['Courses Carrefour', '-65.50', 'Alimentation', '-2 days', 0], // Compte Courant
            ['Essence Total', '-45.00', 'Transport', '-1 day', 0],
            ['Restaurant', '-28.90', 'Loisirs', 'now', 0],
            ['Loyer', '-800.00', 'Logement', '-5 days', 0],
            ['Pharmacie', '-15.60', 'Santé', '-3 days', 0],
            ['Vêtements H&M', '-89.99', 'Shopping', '-1 week', 0],
            ['Salaire', '2500.00', 'Salaire', '-1 month', 0],
            ['Intérêts Livret A', '12.45', 'Autres', '-1 month', 1], // Livret A
            ['Virement épargne', '300.00', 'Autres', '-2 weeks', 2], // Compte Épargne
            ['Retrait DAB', '-50.00', 'Autres', '-3 days', 0],
        ];

        foreach ($operations as $opData) {
            $operation = new Operation();
            $operation->setLabel($opData[0]);
            $operation->setAmount($opData[1]);
            $operation->setDate(new DateTime($opData[3]));
            $operation->setUser($user);
            
            // Trouver la catégorie correspondante
            $categoryIndex = array_search($opData[2], $categories);
            $operation->setCategory($categoryObjects[$categoryIndex]);
            
            // Lier à un compte spécifique
            $accountIndex = $opData[4];
            $operation->setAccount($accountObjects[$accountIndex]);
            
            $manager->persist($operation);
        }

        $manager->flush();
    }
}
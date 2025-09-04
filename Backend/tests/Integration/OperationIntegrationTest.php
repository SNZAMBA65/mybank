<?php

namespace App\Tests\Integration;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class OperationIntegrationTest extends WebTestCase
{
    public function testCreateOperationWorkflow(): void
    {
        $client = static::createClient();
        $container = static::getContainer();

        // Récupérer un utilisateur existant (id = 10 dans ton dump SQL)
        $entityManager = $container->get(EntityManagerInterface::class);
        $user = $entityManager->getRepository(User::class)->find(10);
        $this->assertNotNull($user, "L'utilisateur de test n'existe pas en base");

        // Simuler connexion de cet utilisateur
        $client->loginUser($user);

        // Envoyer une requête POST valide vers l’API
        $client->request(
            'POST',
            '/api/operations',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'label' => 'Test Operation',
                'amount' => 50.00,
                'date' => '2025-01-01',
                'category_id' => 31, // Catégorie Alimentation
                'account_id' => 7    // Compte Courant
            ])
        );

        // Vérifier que la création a bien fonctionné
        $this->assertResponseStatusCodeSame(201);

        // Vérifier que la réponse contient un ID
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $response);
    }
}

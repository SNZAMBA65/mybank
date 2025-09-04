# ================================
# Backend Symfony - Dockerfile
# ================================

# Image de base : PHP-FPM avec Alpine (léger et optimisé)
FROM php:8.3-fpm-alpine

# Installation des paquets nécessaires
RUN apk add --no-cache \
    git \
    curl \
    libzip-dev \
    unzip \
    mysql-client \
    bash \
    icu-dev \
    oniguruma-dev \
    zlib-dev

# Installation des extensions PHP nécessaires pour Symfony
RUN docker-php-ext-install pdo_mysql zip intl

# Installation de Composer (gestionnaire de dépendances PHP)
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Installation de Symfony CLI
RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony*/bin/symfony /usr/local/bin/symfony

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier uniquement composer.json et composer.lock d’abord (pour profiter du cache Docker)
COPY composer.json composer.lock ./

# Installer les dépendances en production sans scripts (évite MakerBundle/cache:clear trop tôt)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copier le reste du projet
COPY . .

# Maintenant qu’on a tout, on peut lancer manuellement cache:clear en prod
RUN php bin/console cache:clear --env=prod || true

# Changer les permissions pour www-data (utilisateur du conteneur PHP)
RUN chown -R www-data:www-data /var/www/html

# Exposer le port 8000 (pour Symfony CLI ou php -S)
EXPOSE 8000

# Commande par défaut : utiliser Symfony pour servir l’app (au lieu de php-fpm direct)
CMD ["symfony", "server:start", "--no-tls", "--port=8000", "--ansi"]

# Utiliser une image légère Node.js 22 basée sur Alpine
FROM node:22-alpine

# Définir le répertoire de travail dans le container
WORKDIR /app

# Copier uniquement les fichiers de dépendances en premier
# → cela permet de tirer parti du cache Docker si le code source change,
#   mais pas les dépendances
COPY package*.json ./

# Installer les dépendances (prod uniquement pour alléger l’image)
# npm ci = installation propre basée sur package-lock.json
RUN npm ci --only=production

# Copier le reste du code source de l'application
COPY . .

# Exposer le port par défaut de Vite (dev server)
EXPOSE 5173

# Lancer le serveur de développement Vite
# --host 0.0.0.0 permet d’écouter sur toutes les interfaces réseau
# (important pour accéder depuis l’extérieur du container)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

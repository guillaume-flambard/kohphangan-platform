# 🔧 GitHub Actions Setup

## GitHub Repository Configuration

Repository créé avec succès : **https://github.com/guillaume-flambard/kohphangan-platform**

## Secrets GitHub Required

Configure ces secrets dans **Settings → Secrets and Variables → Actions** :

### Option 1: Service Account Key (Plus simple)
1. Crée une clé pour un service account existant :
```bash
gcloud iam service-accounts keys create key.json --iam-account=deployment-manager@strayeye.iam.gserviceaccount.com
```

2. Ajoute le contenu de `key.json` comme secret :
   - **Nom** : `GCP_SA_KEY`
   - **Valeur** : Contenu complet du fichier JSON

3. Modifie les workflows pour utiliser `credentials_json` au lieu de `workload_identity_provider`

### Option 2: Workload Identity Federation (Plus sécurisé)
1. Configure WIF :
```bash
gcloud iam workload-identity-pools create github-actions \
    --location=global \
    --description="GitHub Actions pool"

gcloud iam workload-identity-pools providers create-oidc github-provider \
    --location=global \
    --workload-identity-pool=github-actions \
    --issuer-uri=https://token.actions.githubusercontent.com \
    --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository
```

2. Ajoute ces secrets :
   - `WIF_PROVIDER` : L'ID du provider créé
   - `GCP_PROJECT_ID` : `strayeye`

## Test du Déploiement

Une fois les secrets configurés :

```bash
# Push vers main déclenche le déploiement production
git push origin main

# Push vers develop déclenche les tests + staging  
git push origin develop
```

## Workflow Actuel

- ✅ **Repository** : https://github.com/guillaume-flambard/kohphangan-platform
- ✅ **Branches** : `main` (prod) + `develop` (staging)
- ✅ **Actions** : Workflows configurés
- ⚠️  **Secrets** : À configurer pour déploiement auto

## URLs de Production

- **Frontend** : https://phangan.ai/events/waterfall/echo
- **API** : https://waterfall-api-877046715242.asia-southeast1.run.app
- **Repository** : https://github.com/guillaume-flambard/kohphangan-platform

## Statut Actuel

✅ Le système fonctionne déjà en production !
✅ Repository GitHub créé et configuré  
⚠️ Configuration des secrets nécessaire pour CI/CD auto
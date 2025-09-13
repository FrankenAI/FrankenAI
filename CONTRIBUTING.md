# Contributing to FrankenAI

## 🚀 How to Contribute

Nous accueillons les contributions pour améliorer FrankenAI ! Voici comment vous pouvez aider :

### 🧩 Architecture Modulaire

FrankenAI utilise maintenant une **architecture modulaire** pour supporter différents frameworks et langages. Chaque module est responsable de :

1. **Détection** : Identifier si le framework/langage est présent
2. **Versions** : Détecter la version utilisée
3. **Guidelines** : Fournir les chemins vers les fichiers de guidelines
4. **Commandes** : Générer les commandes spécifiques au framework

### 📁 Structure des Modules

Les modules sont organisés dans `src/modules/` et les guidelines dans `src/guidelines/` :

```
src/modules/
├── laravel/
│   ├── index.ts              # Point d'entrée
│   ├── LaravelModule.ts      # Module principal
│   ├── detection.ts          # Logique de détection
│   └── README.md             # Documentation
└── vue/
    ├── index.ts
    ├── VueModule.ts
    └── detection.ts

src/guidelines/
├── laravel/
│   ├── framework.md          # Core Laravel guidelines
│   ├── 10/
│   │   └── features.md       # Laravel 10 specific features
│   └── 11/
│       └── features.md       # Laravel 11 specific features
└── php/
    ├── language.md           # Core PHP guidelines
    ├── 8.3/
    │   └── features.md       # PHP 8.3 specific features
    └── 8.4/
        └── features.md       # PHP 8.4 specific features
```

### 🛠️ Creating a New Module

To add a new framework or language support:

#### 1. Structure du Module

Créez un répertoire `src/modules/[nom-framework]/` avec :

```typescript
// src/modules/mon-framework/index.ts
import { MonFrameworkModule } from './MonFrameworkModule.js';

export default new MonFrameworkModule();
export { MonFrameworkModule };
```

```typescript
// src/modules/mon-framework/MonFrameworkModule.ts
import type {
  FrameworkModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';

export class MonFrameworkModule implements FrameworkModule {
  readonly id = 'mon-framework';
  readonly type = 'framework' as const;
  readonly priority = 50; // 0-100, plus élevé = plus prioritaire

  getMetadata(): ModuleMetadata {
    return {
      name: 'mon-framework',
      displayName: 'Mon Framework',
      description: 'Module pour Mon Framework',
      version: '1.0.0',
      keywords: ['javascript', 'framework', 'frontend']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    // Implémentez votre logique de détection
    return MonFrameworkDetection.detect(context);
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Détectez la version du framework
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    // Retournez les chemins vers vos guidelines
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    // Générez les commandes spécifiques
  }
}
```

#### 2. Logique de Détection

```typescript
// src/modules/mon-framework/detection.ts
export class MonFrameworkDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Vérifiez les indicateurs de présence
    if (context.packageJson?.dependencies?.['mon-framework']) {
      evidence.push('mon-framework dans package.json');
      confidence += 0.8;
    }

    if (context.configFiles.includes('mon-framework.config.js')) {
      evidence.push('fichier de configuration trouvé');
      confidence += 0.7;
    }

    return {
      detected: confidence > 0.3,
      confidence: Math.min(confidence, 1.0),
      evidence
    };
  }
}
```

#### 3. Guidelines

Créez les guidelines dans `src/guidelines/mon-framework/` :

```markdown
<!-- src/guidelines/mon-framework/framework.md -->
# Mon Framework Development Guidelines

## Core Concepts

### Component Structure
```javascript
// Exemple de composant Mon Framework
const MyComponent = {
  template: `<div>{{ message }}</div>`,
  data() {
    return {
      message: 'Hello Mon Framework'
    }
  }
}
```

### Routing
```javascript
// Configuration des routes
const routes = [
  { path: '/', component: HomeComponent },
  { path: '/about', component: AboutComponent }
]
```
```

### 🧪 Tests

Ajoutez des tests dans `src/tests/modules/mon-framework/` :

```typescript
// src/tests/modules/mon-framework/MonFrameworkModule.test.ts
import { describe, it, expect } from 'bun:test';
import { MonFrameworkModule } from '../../../modules/mon-framework/MonFrameworkModule.js';

describe('MonFrameworkModule', () => {
  it('should detect mon-framework projects', async () => {
    const context = {
      projectRoot: '/test',
      configFiles: ['mon-framework.config.js'],
      packageJson: {
        dependencies: { 'mon-framework': '^1.0.0' }
      },
      files: []
    };

    const module = new MonFrameworkModule();
    const result = await module.detect(context);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
  });
});
```

### 📨 Process de Contribution

1. **Fork le repository**
2. **Créez une branche** : `git checkout -b add-mon-framework-module`
3. **Implémentez votre module** selon les guidelines ci-dessus
4. **Ajoutez des tests complets**
5. **Créez une merge request** avec :
   - Description claire du framework ajouté
   - Exemples d'utilisation
   - Tests qui passent
   - Documentation du module

### 💡 Modules Prioritaires

Nous recherchons des contributions pour :

#### Frameworks Frontend
- **Angular** (TypeScript)
- **Astro** (JavaScript/TypeScript)
- **Solid.js** (TypeScript)
- **Qwik** (TypeScript)

#### Frameworks Backend
- **Express.js** (JavaScript/TypeScript)
- **Fastify** (JavaScript/TypeScript)
- **NestJS** (TypeScript)
- **Django** (Python)
- **Flask** (Python)
- **Ruby on Rails** (Ruby)
- **ASP.NET Core** (C#)
- **Spring Boot** (Java)

#### Langages
- **Python**
- **Ruby**
- **Go**
- **Rust**
- **Java**
- **C#**

### 🎯 Standards de Qualité

#### Code
- ✅ **TypeScript strict** : Pas de `any`, typage complet
- ✅ **Performance** : Détection rapide (< 100ms par module)
- ✅ **Gestion d'erreur** : Pas d'exceptions non gérées
- ✅ **Tests** : Couverture > 80%

#### Guidelines
- ✅ **Pratiques** : Exemples de code utilisables
- ✅ **Actuelles** : Basées sur les dernières versions
- ✅ **Structurées** : Sections claires et organisées
- ❌ **Éviter** : Patterns dépréciés, conseils génériques

### ❓ Questions ?

- Ouvrez une issue avec le tag `question`
- Consultez les modules existants comme exemples
- Rejoignez les discussions dans les issues

Merci de contribuer à FrankenAI ! 🚀
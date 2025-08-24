# Branch Strategy & Protection

## Защищенные ветки

### 🚫 main
- **Защищена от удаления** - `allow_deletions: false`
- **Защищена от force push** - `allow_force_pushes: false`
- **Требует PR с ревью** - `required_approving_review_count: 1`
- **Только через develop** - изменения попадают в main только через merge develop

### 🚫 develop  
- **Защищена от удаления** - `allow_deletions: false`
- **Защищена от force push** - `allow_force_pushes: false`
- **Требует PR с ревью** - `required_approving_review_count: 1`
- **Основная ветка разработки** - все feature ветки мержатся в develop

## Workflow

```
feature/* → develop → main
```

1. **Создание feature ветки:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. **Разработка в feature ветке:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

3. **Создание PR в develop:**
   - Создать Pull Request из feature ветки в develop
   - Получить approval от ревьюера
   - Merge в develop

4. **Синхронизация с main:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

## Удаление feature веток

После успешного merge в develop:
```bash
# Удалить локальную ветку
git branch -d feature/new-feature

# Удалить удаленную ветку
git push origin --delete feature/new-feature
```

## Важные правила

- ❌ **НЕ удалять** main и develop ветки
- ❌ **НЕ делать force push** в защищенные ветки
- ✅ **Всегда создавать PR** для изменений в develop
- ✅ **Синхронизировать** main с develop после merge
- ✅ **Удалять feature ветки** после успешного merge

## Автоматическая защита

GitHub Actions автоматически применяет защиту веток при каждом push в main или develop.

## Dev-Agent Remote

Ветки в `dev-agent` remote сохраняются для вашей работы:
- `dev-agent/main`
- `dev-agent/develop`

Вы можете продолжать пушить в эти ветки для синхронизации с основным репозиторием.

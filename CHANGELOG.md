# Changelog

## v2.0 — Автоматизация пайплайна

Полная переработка agent-kit: от ручного copy-paste workflow к автоматической оркестрации через Cursor субагентов.

### Ломающие изменения

- Удалены команды: `init`, `start`, `orchestrate`, `next`, `advance`, `complete`, `handoff`, `reopen`, `isolate`.
- Удалён `team/handoff-template.md` — заменён на role-specific промпт-шаблоны.
- Стейджи переименованы: `planning` → `plan`, `implementation` → `implement`.
- Стейджи удалены: `fix` (имплементер сам чинит при FAIL), `closure` (команда `validate` покрывает это).

### Скрипт упрощён (671 → 155 строк)

- Осталось 3 команды: `bootstrap`, `status`, `validate`.
- Вся оркестрация пайплайна перенесена из скрипта в AI-агента через `rules/orchestrator.mdc`.
- `bootstrap` больше не требует `--task-file` — по умолчанию копирует шаблон из `team/task-template.md`.
- Убрана macOS-зависимость `pbcopy`.

### 4 стейджа вместо 6

| v1 | v2 | Изменение |
|----|-----|-----------|
| planning | plan | переименован |
| implementation | implement | переименован, также обрабатывает fix-циклы |
| review | review | без изменений |
| fix | — | удалён, имплементер чинит сам при FAIL |
| qa | qa | без изменений |
| closure | — | удалён, команда `validate` заменяет |

### Role-specific промпт-шаблоны

Новая директория `team/prompts/` с отдельным шаблоном на каждый стейдж:

- `plan.md` — таблица шагов плана, таблица тест-плана, риски, открытые вопросы.
- `implement.md` — таблица изменений, self-check чеклист, секция ответов на findings (fix-цикл).
- `review.md` — таблица findings с моделью severity, строгая изоляция (нет доступа к плану).
- `qa.md` — таблица валидации AC, таблица browser-шагов, edge cases.

Каждый шаблон использует `{{плейсхолдеры}}`, которые оркестратор заменяет на содержимое файлов перед запуском субагента.

### Orchestrator rule (`rules/orchestrator.mdc`)

Новый Cursor rule, автоматизирующий весь пайплайн:

- Читает промпт-шаблоны и собирает промпты для субагентов.
- Запускает изолированные Task-субагенты на каждый стейдж.
- Парсит вердикты из handoff-файлов.
- Обрабатывает FAIL → re-implement → re-review/re-test циклы (макс. 2).
- Обновляет `status.json` после каждого стейджа.
- Запускает `validate` по завершении.

### Workflow

До (v1): ~36 ручных действий на задачу (скопировать промпт, открыть чат, вставить, выполнить, сохранить handoff, запустить handoff-команду, повторить × 6 стейджей).

После (v2): 3 действия — `bootstrap`, заполнить task.md, одно сообщение в чат.

### npm scripts

```
agent:bootstrap      Создать новый pipeline run
agent:status         Показать состояние пайплайна
agent:validate       Проверить Definition of Done
agent:rules:install  Скопировать rules в .cursor/rules/
```

```markdown
# wb-tariff-service

Сервис для автоматического сбора тарифов Wildberries (короба) с последующей выгрузкой в Google Таблицы. Работает в Docker, использует PostgreSQL и Knex.js.

## Быстрый старт

### 1. Подготовка
```bash
# Клонировать репозиторий
git clone <your-repo>
cd btlz-test

# Создать файл с переменными окружения
cp .env.example .env
# Отредактируйте .env, добавьте:
# - WB_API_TOKEN
# - GOOGLE_SERVICE_ACCOUNT_EMAIL
# - GOOGLE_PRIVATE_KEY
```

### 2. Первый запуск (сборка образа)
```bash
docker compose up --build
```
При первом запуске произойдет сборка Docker образа, создание таблиц в БД и запуск приложения.

### 3. Последующие запуски
```bash
docker compose up
```
Когда образ уже собран, можно запускать без флага `--build`.

## Добавление Google таблиц для выгрузки

После запуска добавьте ID таблиц в БД:

```bash
docker exec -it postgres psql -U postgres -d postgres -c "INSERT INTO spreadsheets (spreadsheet_id) VALUES ('ваш_id_google_таблицы');"
```

## Проверка работы

- **Логи приложения:** `docker compose logs -f app`
- **Данные в БД:** `docker exec -it postgres psql -U postgres -d postgres -c "SELECT * FROM box_tariffs LIMIT 10;"`
- **Ручное обновление таблиц:** `docker exec app node -e "import('./dist/services/googleSheets.service.js').then(m => new m.GoogleSheetsService().updateAllSheets())"`

## Описание
В шаблоне настроены контейнеры для postgres и приложения на nodejs.
Для взаимодействия с БД используется knex.js.
В контейнере app используется build для приложения на ts.

Все настройки можно найти в файлах:
- compose.yaml
- dockerfile
- package.json
- tsconfig.json
- src/config/env/env.ts
- src/config/knex/knexfile.ts

## Команды

### Запуск базы данных отдельно
```bash
docker compose up -d postgres
```

### Миграции и сиды (локально, без Docker)
```bash
npm run knex:dev migrate latest
npm run knex:dev seed run
```

### Запуск приложения в режиме разработки (локально)
```bash
npm run dev
```

### Docker команды
```bash
# Сборка и запуск (первый раз)
docker compose up --build

# Запуск (последующие разы)
docker compose up

# Остановка
docker compose down

# Просмотр логов
docker compose logs -f app

# Полная пересборка (очистка и сборка заново)
docker compose down --rmi local --volumes
docker compose up --build
```

## 🚀 Реализованный функционал

### Сбор данных с Wildberries API
- Ежечасное получение тарифов на короба (`/api/v1/tariffs/box`)
- Сохранение данных в PostgreSQL с обновлением за текущий день (upsert)

### База данных
- Миграции для таблиц:
  - `box_tariffs` — хранение тарифов
  - `spreadsheets` — ID Google-таблиц для выгрузки
- Использование knex.js для работы с БД

### Google Sheets интеграция
- Авторизация через сервисный аккаунт Google
- Автоматическая выгрузка данных на лист `stocks_coefs`
- Сортировка данных по возрастанию коэффициента
- Поддержка множества таблиц (N) через таблицу `spreadsheets`

### Планировщик задач (cron)
- Каждый час — обновление тарифов из WB API
- Каждые 6 часов — обновление Google Таблиц

### Docker
- Полная контейнеризация приложения и базы данных
- Автоматическое выполнение миграций при запуске

### Переменные окружения
- Поддержка `.env` файла для всех секретов:
  - `WB_API_TOKEN` — токен Wildberries
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — email сервисного аккаунта
  - `GOOGLE_PRIVATE_KEY` — приватный ключ для доступа к Google Sheets

## 🔧 Дополнительные команды

### Ручной запуск обновления Google Таблиц
```bash
docker exec -it app sh -c "node -e 'import(\"./dist/services/googleSheets.service.js\").then(m => m.updateAllSheets())'"
```

### Подключение к базе данных
```bash
docker exec -it postgres psql -U postgres -d postgres
```

### Просмотр данных в базе
```bash
docker exec -it postgres psql -U postgres -d postgres -c "SELECT * FROM box_tariffs ORDER BY created_at DESC LIMIT 10;"
```

### Удаление таблицы с ID (если ошиблись)
```bash
docker exec -it postgres psql -U postgres -d postgres -c "DELETE FROM spreadsheets WHERE spreadsheet_id = 'неправильный_id';"
```

## 📌 Примечания

- Для работы Google Sheets необходимо:
  1. Создать сервисный аккаунт в [Google Cloud Console](https://console.cloud.google.com/)
  2. Включить Google Sheets API
  3. Скачать JSON-ключ и добавить `GOOGLE_SERVICE_ACCOUNT_EMAIL` и `GOOGLE_PRIVATE_KEY` в `.env`
  4. Добавить email сервисного аккаунта в редакторы таблицы
  5. Создать лист с именем `stocks_coefs` в Google Таблице
  6. Добавить ID таблицы в БД (команда выше)

- ID Google таблицы можно найти в URL: `https://docs.google.com/spreadsheets/d/THIS_IS_ID/edit`

- При первом запуске обязательно используйте `--build`, при последующих можно просто `docker compose up`

---

PS: С наилучшими пожеланиями!

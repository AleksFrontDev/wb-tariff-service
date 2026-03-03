# wb-tariff-service

Сервис для автоматического сбора тарифов Wildberries (короба) с последующей выгрузкой в Google Таблицы. Работает в Docker, использует PostgreSQL и Knex.js.

## Описание
В шаблоне настроены контейнеры для postgres и приложения на nodejs.
Для взаимодействия с БД используется knex.js.
В контейнере app используется build для приложения на ts, но можно использовать и js.

Все настройки можно найти в файлах:
- compose.yaml
- dockerfile
- package.json
- tsconfig.json
- src/config/env/env.ts
- src/config/knex/knexfile.ts

## Команды

### Запуск базы данных
```bash
docker compose up -d --build postgres
```

### Миграции и сиды (локально)
```bash
npm run knex:dev migrate latest
npm run knex:dev seed run
```

Также можно использовать и остальные команды (`migrate make <name>`, `migrate up`, `migrate down` и т.д.)

### Запуск приложения в режиме разработки
```bash
npm run dev
```

### Запуск приложения в контейнере
```bash
docker compose up -d --build app
```

### Полная пересборка и запуск
```bash
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
- Запуск одной командой: `docker compose up --build`

### Переменные окружения
- Поддержка `.env` файла для всех секретов:
  - `WB_API_TOKEN` — токен Wildberries
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — email сервисного аккаунта
  - `GOOGLE_PRIVATE_KEY` — приватный ключ для доступа к Google Sheets

### Проверка работы
- Логирование всех ключевых этапов
- Ручной запуск обновления таблиц через Node.js

## 🔧 Дополнительные команды

### Ручной запуск обновления Google Таблиц
```bash
docker exec -it app sh -c "node -e 'import(\"./dist/services/googleSheets.service.js\").then(m => m.updateAllSheets())'"
```

### Просмотр данных в базе
```bash
docker exec -it postgres psql -U postgres -d postgres -c "SELECT * FROM box_tariffs;"
```

### Очистка фейковых ID таблиц (если есть `some_spreadsheet`)
```bash
docker exec -it postgres psql -U postgres -d postgres -c "DELETE FROM spreadsheets WHERE spreadsheet_id = 'some_spreadsheet';"
```

## 📌 Примечания

- Для работы Google Sheets необходимо:
  1. Создать сервисный аккаунт в Google Cloud Console
  2. Включить Google Sheets API
  3. Скачать JSON-ключ и добавить `GOOGLE_SERVICE_ACCOUNT_EMAIL` и `GOOGLE_PRIVATE_KEY` в `.env`
  4. Добавить email сервисного аккаунта в редакторы таблицы
  5. Создать лист с именем `stocks_coefs` в Google Таблице
  6. Добавить ID таблицы в БД через `INSERT INTO spreadsheets (spreadsheet_id) VALUES ('твой_id');`
- Токен WB API выдан на hh.ru после подтверждения готовности выполнить задание.

---

PS: С наилучшими пожеланиями!

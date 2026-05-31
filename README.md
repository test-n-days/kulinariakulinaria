# 🍳 Kulinaria — Пошук рецептів

Вебзастосунок для пошуку рецептів з усього світу. Побудований на **ASP.NET Core 8** з використанням API [TheMealDB](https://www.themealdb.com/api/json/v1/1).

## Можливості

- 🔍 **Пошук за назвою** — знайдіть страву за назвою
- 🥕 **Пошук за інгредієнтом** — шукайте рецепти з наявних продуктів
- 🎲 **Випадковий рецепт** — відкрийте для себе щось нове
- 📂 **Категорії** — переглядайте страви за категоріями
- 📝 **Детальний перегляд** — інгредієнти, покрокова інструкція, посилання на YouTube

## Вимоги

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Підключений до інтернету

## Запуск

```bash
cd RecipeSearch
dotnet run
```

Відкрийте браузер за адресою `http://localhost:5000` (або `https://localhost:5001`).

## Технології

- **ASP.NET Core 8** — бекенд з мінімальним API
- **Vanilla HTML/CSS/JS** — фронтенд без залежностей
- **TheMealDB API** — база рецептів

## Побудова самостійного виконуваного файлу (.exe для Windows)

```powershell
# З PowerShell
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./publish
# Результат: ./publish/Kulinaria.exe
```

## Технології

- **ASP.NET Core 8** — бекенд з мінімальним API
- **Vanilla HTML/CSS/JS** — фронтенд без залежностей
- **TheMealDB API** — база рецептів

## Структура проєкту

```
RecipeSearch/
├── Program.cs              — ASP.NET Core мінімальний API
├── RecipeSearch.csproj     — файл проєкту
├── wwwroot/
│   ├── index.html          — головна сторінка
│   ├── style.css           — стилі
│   └── app.js              — клієнтська логіка
└── README.md
```

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient("mealdb", c =>
{
    c.BaseAddress = new Uri("https://www.themealdb.com/api/json/v1/1/");
    c.Timeout = TimeSpan.FromSeconds(15);
});
var app = builder.Build();

app.UseStaticFiles();

// ── API: пошук за назвою ──
app.MapGet("/api/search", async (IHttpClientFactory http, string? s) =>
{
    if (string.IsNullOrWhiteSpace(s)) return Results.Ok(Array.Empty<object>());
    var client = http.CreateClient("mealdb");
    var resp = await client.GetAsync($"search.php?s={Uri.EscapeDataString(s)}");
    resp.EnsureSuccessStatusCode();
    var json = await resp.Content.ReadAsStringAsync();
    using var doc = System.Text.Json.JsonDocument.Parse(json);
    if (!doc.RootElement.TryGetProperty("meals", out var meals) || meals.ValueKind == System.Text.Json.JsonValueKind.Null)
        return Results.Ok(Array.Empty<object>());
    return Results.Content(meals.GetRawText(), "application/json");
});

// ── API: пошук за інгредієнтом ──
app.MapGet("/api/search/ingredient", async (IHttpClientFactory http, string? i) =>
{
    if (string.IsNullOrWhiteSpace(i)) return Results.Ok(Array.Empty<object>());
    var client = http.CreateClient("mealdb");
    var resp = await client.GetAsync($"filter.php?i={Uri.EscapeDataString(i)}");
    resp.EnsureSuccessStatusCode();
    var json = await resp.Content.ReadAsStringAsync();
    using var doc = System.Text.Json.JsonDocument.Parse(json);
    if (!doc.RootElement.TryGetProperty("meals", out var meals) || meals.ValueKind == System.Text.Json.JsonValueKind.Null)
        return Results.Ok(Array.Empty<object>());
    return Results.Content(meals.GetRawText(), "application/json");
});

// ── API: випадковий рецепт ──
app.MapGet("/api/random", async (IHttpClientFactory http) =>
{
    var client = http.CreateClient("mealdb");
    var resp = await client.GetAsync("random.php");
    resp.EnsureSuccessStatusCode();
    var json = await resp.Content.ReadAsStringAsync();
    using var doc = System.Text.Json.JsonDocument.Parse(json);
    if (!doc.RootElement.TryGetProperty("meals", out var meals) || meals.ValueKind == System.Text.Json.JsonValueKind.Null)
        return Results.NotFound();
    return Results.Content(meals[0].GetRawText(), "application/json");
});

// ── API: категорії ──
app.MapGet("/api/categories", async (IHttpClientFactory http) =>
{
    var client = http.CreateClient("mealdb");
    var resp = await client.GetAsync("categories.php");
    resp.EnsureSuccessStatusCode();
    var json = await resp.Content.ReadAsStringAsync();
    using var doc = System.Text.Json.JsonDocument.Parse(json);
    if (!doc.RootElement.TryGetProperty("categories", out var cats) || cats.ValueKind == System.Text.Json.JsonValueKind.Null)
        return Results.Ok(Array.Empty<object>());
    return Results.Content(cats.GetRawText(), "application/json");
});

// ── API: страви за категорією ──
app.MapGet("/api/category", async (IHttpClientFactory http, string? c) =>
{
    if (string.IsNullOrWhiteSpace(c)) return Results.Ok(Array.Empty<object>());
    var client = http.CreateClient("mealdb");
    var resp = await client.GetAsync($"filter.php?c={Uri.EscapeDataString(c)}");
    resp.EnsureSuccessStatusCode();
    var json = await resp.Content.ReadAsStringAsync();
    using var doc = System.Text.Json.JsonDocument.Parse(json);
    if (!doc.RootElement.TryGetProperty("meals", out var meals) || meals.ValueKind == System.Text.Json.JsonValueKind.Null)
        return Results.Ok(Array.Empty<object>());
    return Results.Content(meals.GetRawText(), "application/json");
});

// ── API: деталі рецепту за ID ──
app.MapGet("/api/meal", async (IHttpClientFactory http, string? i) =>
{
    if (string.IsNullOrWhiteSpace(i)) return Results.BadRequest();
    var client = http.CreateClient("mealdb");
    var resp = await client.GetAsync($"lookup.php?i={Uri.EscapeDataString(i)}");
    resp.EnsureSuccessStatusCode();
    var json = await resp.Content.ReadAsStringAsync();
    using var doc = System.Text.Json.JsonDocument.Parse(json);
    if (!doc.RootElement.TryGetProperty("meals", out var meals) || meals.ValueKind == System.Text.Json.JsonValueKind.Null)
        return Results.NotFound();
    return Results.Content(meals[0].GetRawText(), "application/json");
});

app.MapFallbackToFile("index.html");

app.Run();

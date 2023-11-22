using FifteenthStandard.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json")
    .AddJsonFile($"appsettings.Development.json")
    .AddEnvironmentVariables(prefix: "kaby_")
    .AddCommandLine(args);

builder.Services.AddCors(opts => opts.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

var root = app.Configuration["Root"] ?? Environment.CurrentDirectory;

Console.WriteLine($"Setting content root: {root}");

IBlobStore? blobStore = null;
if (root.StartsWith("s3://"))
{
    Console.WriteLine("Using AWS S3 storage");
    blobStore = new AwsBlobStore(root);
}
else if (root.StartsWith("DefaultEndpointsProtocol"))
{
    Console.WriteLine("Using Azure Storage storage");
    blobStore = new AzureBlobStore(root, "kaby");
}
else
{
    Console.WriteLine("Using file storage");
    blobStore = new FileBlobStore(root);
}

app.UseCors();

app.MapGet(
    "/",
    async () =>
    {
        var paths = await blobStore.ListAsync();
        Console.WriteLine($"GET / - - - 200");
        return Results.Content(
            string.Join('\n', paths),
            "text/plain",
            System.Text.Encoding.UTF8,
            200);
    });

app.MapGet(
    "/{filename}",
    async (string filename) =>
    {
        var blob = await blobStore.GetStringAsync(filename);
        if (blob == null)
        {
            Console.WriteLine($"GET /{filename} - - - 404");
            return Results.NotFound();
        }

        Console.WriteLine($"GET /{filename} - - - 200");
        return Results.Content(
            blob,
            "text/plain",
            System.Text.Encoding.UTF8,
            200);
    });

app.MapPut(
    "/{filename}",
    async (string filename, HttpContext context) =>
    {
        using (var reader = new StreamReader(context.Request.Body))
        {
            var blob = await reader.ReadToEndAsync();
            await blobStore.PutStringAsync(filename, blob);
        }
        Console.WriteLine($"PUT /{filename} - - - 204    ");
        return  Results.NoContent();
    });

app.MapDelete(
    "/{filename}",
    async (string filename, HttpContext context) =>
    {
        await blobStore.RemoveAsync(filename);
        Console.WriteLine($"DELETE /{filename} - - - 204    ");
        return Results.NoContent();
    });

app.Run();

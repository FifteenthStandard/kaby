using FifteenthStandard.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(opts => opts.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

string? root;
if (args.Length > 0)
{
    root = args[0];
    Console.WriteLine($"Setting root from arguments: {root}");
}
else if (!string.IsNullOrWhiteSpace(root = Environment.GetEnvironmentVariable("kaybee")))
{
    Console.WriteLine($"Setting root from environment variable: {root}");
}
else if (!string.IsNullOrWhiteSpace(root = app.Configuration?.GetValue<string>("root")))
{
    Console.WriteLine($"Setting root from config: {root}");
}
else
{
    root = Environment.CurrentDirectory;
    Console.WriteLine($"Setting root from current directory: {root}");
}

IBlobStore? blobStore = null;
if (root.StartsWith("s3://"))
{
    Console.WriteLine("Using AWS S3 storage");
    blobStore = new AwsBlobStore(root);
}
else if (root.StartsWith("DefaultEndpointsProtocol"))
{
    Console.WriteLine("Using Azure Storage storage");
    blobStore = new AzureBlobStore(root, "kaybee");
}
else
{
    Console.WriteLine("Using file storage");
    blobStore = new FileBlobStore(root);
}

app.UseCors();

app.MapGet(
    "/{filename}",
    async (string filename) =>
    {
        var blob = await blobStore.GetStringAsync(filename);
        if (blob == null)
        {
            Console.WriteLine($"GET {filename} - - - 404");
            return Results.NotFound();
        }

        Console.WriteLine($"GET {filename} - - - 200");
        return Results.Content(
            blob,
            "text/markdown",
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
        Console.WriteLine($"PUT {filename} - - - 204    ");
        return  Results.NoContent();
    });

app.Run();

using ProgrammerProject.IRepository;
using ProgrammerProject.Repository;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddScoped<IProgrammerRepository, ProgrammerRepository>();
builder.Services.AddScoped<IStudyRepository,StudyRepository>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

//app.MapGet("/", context =>
//{
//    context.Response.Redirect("/Programmers");
//    return Task.CompletedTask;
//});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthorization();
app.MapRazorPages();
app.Run();
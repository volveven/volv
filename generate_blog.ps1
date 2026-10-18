# Erzeugt blog.html aus blog_template.html und all_articles_clean.json.
# Aufruf im Repository-Ordner:  powershell -ExecutionPolicy Bypass -File .\generate_blog.ps1
# Das Markup entspricht dem Python-Generator, mit dem die Seite im Redesign erzeugt wurde.
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Web

$root = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
$template = [System.IO.File]::ReadAllText((Join-Path $root "blog_template.html"), $utf8)
$jsonRaw  = [System.IO.File]::ReadAllText((Join-Path $root "all_articles_clean.json"), $utf8)
$articles = $jsonRaw | ConvertFrom-Json

Write-Host "Loaded $($articles.Count) articles."

function Enc([string]$s) { return [System.Web.HttpUtility]::HtmlEncode($s) }

$cards = New-Object System.Text.StringBuilder
$posts = New-Object System.Text.StringBuilder

foreach ($art in $articles) {
    $t = Enc $art.title
    $c = Enc $art.category
    $d = Enc $art.date
    $r = Enc $art.readTime
    $e = Enc $art.excerpt
    $id = $art.id
    $img = $art.image
    $content = $art.content.Replace("<h2>", "<h3>").Replace("</h2>", "</h3>")

    [void]$cards.AppendLine(@"
        <article class="post-card" data-cats="$c">
          <h3 class="post-card__title"><a href="#$id" data-open="$id">$t</a></h3>
          <div class="figure"><img class="mono-img" src="$img" alt="" loading="lazy" decoding="async"></div>
          <p class="post-card__meta"><span class="cat">$c</span><span>$d</span><span>$r</span></p>
          <p class="post-card__text">$e</p>
        </article>
"@)

    [void]$posts.AppendLine(@"
      <article class="post" id="$id" aria-labelledby="$id-t">
        <p class="post__meta"><span class="cat">$c</span><span>$d</span><span>$r Lesezeit</span></p>
        <h2 class="post__title" id="$id-t">$t</h2>
        <div class="figure"><img class="mono-img" src="$img" alt="" loading="lazy" decoding="async"></div>
        <div class="post__body prose">$content</div>
        <p class="post__back"><a class="link" href="#beitraege" data-close>Zurück zur Übersicht</a></p>
      </article>
"@)
}

$final = $template.Replace("<!-- CARDS_PLACEHOLDER -->", $cards.ToString().TrimEnd())
$final = $final.Replace("<!-- ARTICLES_PLACEHOLDER -->", $posts.ToString().TrimEnd())
# Vorlage ist noindex; die erzeugte Seite bekommt die kanonische Adresse
$final = $final.Replace('<meta name="robots" content="noindex">', '<link rel="canonical" href="https://volvevent.de/blog.html">')

[System.IO.File]::WriteAllText((Join-Path $root "blog.html"), $final, $utf8)
Write-Host "Generated blog.html ($($final.Length) chars)."

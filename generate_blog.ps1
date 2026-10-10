$ErrorActionPreference = "Stop"

$template = [System.IO.File]::ReadAllText("c:\volvevent\blog_template.html", [System.Text.Encoding]::UTF8)
$jsonRaw = [System.IO.File]::ReadAllText("c:\volvevent\all_articles_clean.json", [System.Text.Encoding]::UTF8)
$articles = $jsonRaw | ConvertFrom-Json

Write-Host "Loaded $($articles.Count) articles."

$cardsHtml = New-Object System.Text.StringBuilder

foreach ($art in $articles) {
    $secClass = if ($art.category -eq 'Security Audit') { ' badge-sec' } else { '' }
    $titleSafe = [System.Web.HttpUtility]::HtmlEncode($art.title)
    $excerptSafe = [System.Web.HttpUtility]::HtmlEncode($art.excerpt)
    $catSafe = [System.Web.HttpUtility]::HtmlEncode($art.category)
    $dateSafe = [System.Web.HttpUtility]::HtmlEncode($art.date)
    $readSafe = [System.Web.HttpUtility]::HtmlEncode($art.readTime)

    $card = @"
                <article class="artikel-karte" data-category="$catSafe" onclick="openArticle('$($art.id)')">
                    <div class="card-img-wrap">
                        <img src="$($art.image)" alt="$titleSafe" loading="lazy">
                        <span class="card-cat-badge$secClass">$catSafe</span>
                    </div>
                    <div class="card-content">
                        <div class="card-meta">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>$dateSafe &bull; $readSafe</span>
                        </div>
                        <h3 class="card-title">$titleSafe</h3>
                        <p class="card-excerpt">$excerptSafe</p>
                        <div class="card-footer">
                            <span class="read-more-btn interaktives-element">Vollst&auml;ndigen Artikel lesen &rarr;</span>
                        </div>
                    </div>
                </article>
"@
    [void]$cardsHtml.AppendLine($card)
}

$finalHtml = $template.Replace("<!-- CARDS_PLACEHOLDER -->", $cardsHtml.ToString())
$finalHtml = $finalHtml.Replace("ARTICLE_DATA_PLACEHOLDER", $jsonRaw)

[System.IO.File]::WriteAllText("c:\volvevent\blog.html", $finalHtml, [System.Text.Encoding]::UTF8)
Write-Host "Successfully generated c:\volvevent\blog.html! Total length: $($finalHtml.Length) bytes."

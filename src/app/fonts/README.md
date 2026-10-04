# Bundled fonts

Inter and JetBrains Mono are bundled locally with their SIL Open Font License files. They include Latin and Cyrillic glyphs and variable weights. Next.js uses `next/font/local`; development and production builds require no Google Fonts requests.

Downloaded over verified HTTPS from the official `google/fonts` repository:

- `https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf`
- `https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf`

SHA-256 of the bundled files (recorded after download):

```text
29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031  Inter.ttf
48715a42ec242c21e9f02692891e147d022299a52e48d5e413e1a942193ffeda  JetBrainsMono.ttf
```

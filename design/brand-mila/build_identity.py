"""Build the mila. identity guide and practical exports from the Astra SVG masters."""
from pathlib import Path
import sys
import shutil
import subprocess
import json
import zipfile
import html
import xml.etree.ElementTree as ET

sys.path.insert(0, "/private/tmp/mila-brand-deps")
from fontTools.ttLib import TTFont as Font
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
from PIL import Image

ROOT = Path(__file__).resolve().parent
V = ROOT / "vectors"
PNG = ROOT / "png"
SOCIAL = ROOT / "social"
FONTS = ROOT / "fonts"
WEB = ROOT / "web"
OUT = ROOT.parents[1] / "output" / "pdf"
for folder in [PNG, SOCIAL, FONTS, OUT, WEB]:
    folder.mkdir(parents=True, exist_ok=True)

COLORS = {"mineral": "#173F3B", "ivory": "#F6F3ED", "sand": "#D9CBB8", "ink": "#1E2B28", "sage": "#8FA89B", "white": "#FFFFFF"}
MINERAL, IVORY, SAND, INK, SAGE, WHITE = COLORS.values()
W, H = 960, 640

for weight, name in [(400, "Regular"), (500, "Medium"), (600, "SemiBold"), (700, "Bold")]:
    dest = FONTS / f"Manrope-{name}.ttf"
    font = instantiateVariableFont(Font("/private/tmp/mila-manrope.ttf"), {"wght": weight}, inplace=True, updateFontNames=True)
    font.save(dest)
    pdfmetrics.registerFont(TTFont(name, str(dest)))
shutil.copy2("/private/tmp/mila-manrope-OFL.txt", FONTS / "OFL.txt")
pdfmetrics.registerFont(TTFont("Manrope", str(FONTS / "Manrope-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Manrope-Bold", str(FONTS / "Manrope-SemiBold.ttf")))
pdfmetrics.registerFontFamily("Manrope", normal="Manrope", bold="Manrope-Bold", italic="Manrope", boldItalic="Manrope-Bold")

def rgb(value):
    return tuple(int(value[i:i+2], 16) for i in (1, 3, 5))

def contrast(a, b):
    def lum(s):
        channels = [v/255 for v in rgb(s)]
        channels = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in channels]
        return sum(v*k for v,k in zip(channels, [.2126,.7152,.0722]))
    x,y = sorted([lum(a),lum(b)])
    return (y+.05)/(x+.05)

def svg_image(path, width, output):
    subprocess.run(["/opt/homebrew/bin/magick", "-background", "none", "-density", "192", str(path), "-resize", f"{width}x", "-depth", "8", "PNG32:"+str(output)], check=True)

for source in sorted(V.glob("*.svg")):
    svg_image(source, 2400 if "wordmark" in source.stem else 1080, PNG / f"{source.stem}.png")

favicon_tree = ET.parse(V / "symbol-mineral.svg")
favicon_tree.getroot().set("viewBox", "-20 -30 348 348")
favicon_tree.write(WEB / "favicon.svg", encoding="utf-8", xml_declaration=True)
for size in [16,32,48,64]:
    svg_image(WEB / "favicon.svg", size, WEB / f"favicon-{size}.png")
Image.open(WEB / "favicon-64.png").save(WEB / "favicon.ico", sizes=[(16,16),(32,32),(48,48),(64,64)])
Image.open(PNG / "avatar-mineral.png").resize((180,180),Image.Resampling.LANCZOS).save(WEB / "apple-touch-icon.png")

def inside_svg(path):
    tree = ET.parse(path).getroot()
    content = "".join(ET.tostring(node, encoding="unicode") for node in tree if node.tag.rsplit("}",1)[-1] not in ["title", "desc"])
    return tree.attrib["viewBox"], tree.attrib.get("fill", MINERAL), content

def nested_svg(path, x, y, w, h):
    vb, fill, content = inside_svg(path)
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="{vb}" fill="{fill}">{content}</svg>'

def svg_text(text, x, y, size, fill=MINERAL, weight=400):
    return f'<text x="{x}" y="{y}" font-family="Manrope, sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}">{html.escape(text)}</text>'

def create_social(kind):
    width, height = (1080, 1350) if kind == "post" else (1080, 1920)
    margin = 84
    header_y = 70 if kind == "post" else 270
    content_y = 340 if kind == "post" else 620
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
             f'<rect width="{width}" height="{height}" fill="{IVORY}"/>',
             nested_svg(V/"wordmark-mineral.svg",margin,header_y,310,90)]
    for i, line in enumerate(["Sua peça merece", "um preço que", "faça sentido."]):
        parts.append(svg_text(line,margin,content_y+i*106,78,MINERAL,600))
    base = content_y+350
    parts.append(f'<line x1="84" y1="{base}" x2="996" y2="{base}" stroke="{SAND}" stroke-width="3"/>')
    for i,line in enumerate(["Joias e semijoias.", "Custos e margens com clareza."]):
        parts.append(svg_text(line,margin,base+78+i*50,36,INK))
    parts.append(f'<rect x="84" y="{height-360}" width="912" height="150" rx="12" fill="{MINERAL}"/>')
    parts.append(svg_text("Conheça a mila.",126,height-272,40,IVORY,600))
    parts.append(svg_text("milaai.com.br",margin,height-100,28,INK))
    parts.append(nested_svg(V/"symbol-mineral.svg",875,height-178,121,84))
    parts.append('</svg>')
    file = SOCIAL/f"template-{kind}.svg"
    file.write_text("\n".join(parts), encoding="utf-8")
    return file

# Editable SVG templates retain live Manrope text; logo masters are all outlines.
for kind in ["post", "story"]:
    create_social(kind)

PDF = OUT / "mila-ai-identidade-visual.pdf"
c = canvas.Canvas(str(PDF), pagesize=(W,H))
c.setTitle("mila. | Identidade visual - direção mineral")
c.setAuthor("mila. - desenvolvimento com Astra")

def rect(x,y,w,h,color,radius=0):
    c.setFillColor(HexColor(color))
    if radius: c.roundRect(x,H-y-h,w,h,radius,stroke=0,fill=1)
    else: c.rect(x,H-y-h,w,h,stroke=0,fill=1)

def text(value,x,y,size=14,font="Regular",color=INK):
    c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,H-y-size*.82,value)

def lines(value,x,y,width,size=14,font="Regular",color=INK,leading=None):
    leading = leading or size*1.45
    current="";result=[]
    for word in value.split():
        candidate=(current+" "+word).strip()
        if pdfmetrics.stringWidth(candidate,font,size)>width and current:
            result.append(current);current=word
        else: current=candidate
    if current: result.append(current)
    for i,line in enumerate(result): text(line,x,y+i*leading,size,font,color)
    return len(result)*leading

def svg(path,x,y,w,h):
    drawing=svg2rlg(str(path))
    scale=min(w/drawing.width,h/drawing.height)
    c.saveState();c.translate(x+(w-drawing.width*scale)/2,H-y-h+(h-drawing.height*scale)/2)
    c.scale(scale,scale);renderPDF.draw(drawing,c,0,0);c.restoreState()

def logo(x,y,w,h=100,inverse=False):
    svg(V/("wordmark-ivory.svg" if inverse else "wordmark-mineral.svg"),x,y,w,h)

def symbol(x,y,w,h,inverse=False):
    svg(V/("symbol-ivory.svg" if inverse else "symbol-mineral.svg"),x,y,w,h)

def rule(x,y,w,color=SAND):
    c.setStrokeColor(HexColor(color));c.setLineWidth(.8);c.line(x,H-y,x+w,H-y)

def start(title,number,dark=False):
    bg,fg=(MINERAL,IVORY) if dark else (IVORY,MINERAL)
    rect(0,0,W,H,bg)
    if title: text(title,48,43,28,"SemiBold",fg)
    text("mila. / identidade visual",48,608,10,"Medium",fg)
    text(f"{number:02d}",885,608,10,"Medium",fg)

def end(): c.showPage()

# 1 - Overview; also exported as the presentation board.
start("",1)
text("Uma presença próxima. Uma marca segura.",48,46,23,"Medium",MINERAL)
logo(48,190,565,170)
lines("Inteligência para quem vende joias e semijoias.",52,395,475,22,"Regular",MINERAL)
rect(684,154,228,280,MINERAL,0)
symbol(726,234,144,96,True)
text("Símbolo de perfil",716,455,12,"Medium",MINERAL)
for i,(name,col) in enumerate([("Mineral",MINERAL),("Marfim",IVORY),("Areia",SAND),("Tinta",INK),("Sálvia",SAGE)]):
    rect(48+i*172.8,515,172.8,55,col)
    text(name,58+i*172.8,577,10,"Medium",MINERAL)
end()

# 2 - Mark system.
start("A logo que você escolheu, em vetor.",2)
lines("O desenho da primeira opção foi reconstruído em curvas. As letras arredondadas mantêm a proximidade; a nova cor e o uso disciplinado dão sobriedade ao conjunto.",48,95,830,15)
rect(48,176,420,174,WHITE);logo(80,214,356,90)
rect(492,176,420,174,MINERAL);logo(524,214,356,90,True)
text("Principal / verde mineral",48,364,12,"Medium")
text("Inversa / marfim",492,364,12,"Medium")
rect(48,408,420,115,WHITE);svg(V/"wordmark-black.svg",88,432,340,64)
rect(492,408,420,115,"#000000");svg(V/"wordmark-white.svg",532,432,340,64)
text("Monocromática / preto",48,536,12,"Medium")
text("Monocromática / branco",492,536,12,"Medium")
end()

# 3 - Symbol and profile proof.
start("m. é a assinatura curta da mila.",3)
lines("O mesmo m da logo, acompanhado de um ponto na linha de base. Use em avatar, favicon e assinaturas pequenas; mantenha mila. por extenso quando a marca ainda precisar ser apresentada.",48,94,830,15)
rect(48,184,285,285,MINERAL);symbol(88,278,205,102,True)
c.setStrokeColor(HexColor(SAGE));c.setLineWidth(1);c.circle(190.5,H-326.5,128,stroke=1,fill=0)
text("Avatar / margem para recorte circular",48,490,11,"Medium")
symbol(391,210,221,134)
text("Marca independente",399,368,12,"Medium")
for x,size in [(690,32),(759,48),(835,64)]:
    rect(x,258,size,size,MINERAL,size/2)
    symbol(x+size*.16,258+size*.31,size*.68,size*.36,True)
    text(f"{size} px",x,342,10,"Medium")
lines("Reconhecível em tamanhos pequenos. Não adicionar o sufixo .ai dentro do avatar: ele perde leitura e aperta a composição.",682,394,225,13)
text("Arquivos quadrados de 1080 px prontos para Instagram e WhatsApp.",48,550,14,"Medium",MINERAL)
end()

# 4 - Color system.
start("Uma paleta mais sóbria e acolhedora.",4)
lines("Verde mineral é a assinatura. Marfim traz luz; areia apoia a composição. A cor é uma escolha de posicionamento, não uma promessa universal sobre como cada pessoa a perceberá.",48,96,830,15)
palette=[("Mineral",MINERAL,"Logo, botões e áreas de marca"),("Marfim",IVORY,"Fundo principal e versão inversa"),("Areia",SAND,"Superfícies e detalhes discretos"),("Tinta",INK,"Textos e informação"),("Sálvia",SAGE,"Apoio gráfico, sem texto pequeno")]
for i,(name,col,role) in enumerate(palette):
    x=48+i*175
    rect(x,183,163,124,col)
    text(name,x,325,17,"SemiBold")
    text(col,x,352,13,"Medium")
    text("RGB "+" / ".join(map(str,rgb(col))),x,376,10)
    lines(role,x,409,154,12)
rule(48,485,864)
text("Contrastes medidos",48,511,17,"SemiBold",MINERAL)
text(f"Mineral sobre marfim: {contrast(MINERAL,IVORY):.1f}:1",48,548,13)
text(f"Tinta sobre marfim: {contrast(INK,IVORY):.1f}:1",359,548,13)
text("Sálvia e areia são cores de apoio.",646,548,12)
end()

# 5 - Typography and voice.
start("Clareza em cada palavra.",5)
text("Manrope",48,125,67,"SemiBold",MINERAL)
text("Aa Bb Cc 0123456789",51,215,28,"Regular",INK)
lines("Uma única família para títulos, textos, botões e números. A logo é desenho próprio: não deve ser digitada com Manrope nem substituída por ela.",48,277,402,15)
rule(48,380,405)
for i,(name,desc) in enumerate([("Semibold 600","Títulos e chamadas"),("Medium 500","Botões e navegação"),("Regular 400","Textos e descrições")]):
    text(name,48,410+i*42,14,"SemiBold");text(desc,209,410+i*42,12)
text("A voz da mila",530,131,24,"SemiBold",MINERAL)
lines("Próxima, direta e competente. Explica os números, orienta o próximo passo e evita exageros.",530,179,357,16)
rect(530,283,382,202,WHITE)
text("Exemplo de tom",553,307,12,"SemiBold",MINERAL)
lines("Vamos olhar o custo da peça, as taxas e a margem que você quer manter. Com isso, chegamos a um preço que faz sentido para sua loja.",553,344,332,18)
text("Evitar: diminutivos, superlativos e promessas fáceis.",530,510,11,"Medium")
end()

# 6 - Social application. Vector drawing retains sharpness in PDF.
start("Pronta para aparecer no dia a dia.",6)
svg(SOCIAL/"template-post.svg",48,118,314,392)
svg(SOCIAL/"template-story.svg",407,118,220,392)
text("Post / 1080 × 1350",48,526,12,"Medium")
text("Story / 1080 × 1920",407,526,12,"Medium")
rect(690,133,174,174,MINERAL)
symbol(718,190,118,64,True)
text("@usemila.ai",704,326,17,"SemiBold",MINERAL)
lines("O nome completo apresenta. O m. assina. Conteúdo com respiro, poucas cores e uma ideia por peça.",688,376,210,15)
text("Templates editáveis em SVG; instalar Manrope para editar os textos.",48,569,11)
end()

# 7 - A site application, no production changes.
start("A identidade aplicada ao site.",7)
rect(48,107,864,418,WHITE)
rect(48,107,864,51,IVORY)
logo(73,119,105,27)
text("Planos",693,127,9,"Medium");text("Dúvidas",746,127,9,"Medium")
rect(807,117,82,30,MINERAL,7);text("Começar",824,127,9,"SemiBold",IVORY)
rect(48,158,864,367,IVORY)
for i,line in enumerate(["A inteligência por trás", "de quem vende joias", "e semijoias."]):
    text(line,78,207+i*39,31,"SemiBold",MINERAL)
lines("Tenha a mila no seu WhatsApp para analisar custos e margens e preparar descrições das peças.",80,348,383,12)
rect(80,415,186,42,MINERAL,8);text("Começar com a mila",98,430,12,"SemiBold",IVORY)
text("Prévia da conversa no WhatsApp",81,472,10,"Regular",INK)
rect(605,179,224,324,INK,23);rect(614,191,206,300,"#E9EFEB",16)
rect(614,191,206,41,MINERAL,0);symbol(627,202,27,16,True)
text("mila.",663,203,11,"SemiBold",IVORY)
rect(650,250,155,53,"#D6E2DB",7)
lines("Quanto devo cobrar por esta peça?",661,263,134,11)
rect(627,320,174,126,WHITE,7)
lines("Vamos calcular com clareza.",639,332,148,12,"SemiBold",MINERAL)
lines("Custo da peça + despesas + taxas + margem desejada.",639,372,148,11)
text("Conversa ilustrativa",648,469,9,"Regular",INK)
lines("A estrutura atual pode continuar. A proposta atualiza a logo, unifica os destaques, clareia o mockup e aplica o verde mineral às ações. Não exige reconstruir a página.",48,547,864,13)
end()

# 8 - Practical use.
start("Consistência é o que faz a marca crescer.",8)
left=[("Respiro","Deixar ao redor da logo pelo menos um diâmetro do ponto. Não encostar em bordas ou textos."),
      ("Tamanho","Logo: mínimo de 128 px; preferir 160 px. Em impressão, 25 mm. Símbolo: 32 px. Avatar: 48 px; preferir 64 px ou mais."),
      ("Fundo","Usar a versão mineral sobre fundos claros e a versão marfim sobre fundos escuros. Preferir áreas lisas e com bom contraste.")]
right=[("Preservar o desenho","Não esticar, inclinar, adicionar contorno, sombra, brilho, degradê ou separar o ponto do símbolo."),
       ("Usar o arquivo certo","SVG para site e edição vetorial. PNG para aplicativos e redes. Templates SVG têm textos editáveis em Manrope."),
       ("Produção","As cores oficiais são digitais (HEX/RGB). Para impressão, pedir prova e conversão pelo perfil da gráfica. O site ao lado é uma proposta visual.")]
for col,items in [(48,left),(510,right)]:
    y=118
    for title,body in items:
        text(title,col,y,19,"SemiBold",MINERAL)
        lines(body,col,y+35,382,14)
        y+=145
text("Desenvolvimento com Astra / versão 1.0 / setembro de 2026",48,569,11,"Medium")
end();c.save()

# Export a standalone one-page logo sheet PDF is unnecessary: the vector SVG masters are the source.
renderer="/Users/msvasconcelos/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm"
proof=ROOT/"preview"
proof.mkdir(exist_ok=True)
subprocess.run([renderer,"-scale-to","1600","-png",str(PDF),str(proof/"guide")],check=True)
pages=sorted(proof.glob("guide-*.png"))
shutil.copy2(pages[0],ROOT/"identidade-mila-preview.png")
shutil.copy2(pages[6],ROOT/"proposta-site.png")

# Social PNG exports rendered using the same registered font and SVG interpreter.
for kind in ["post","story"]:
    drawing=svg2rlg(str(SOCIAL/f"template-{kind}.svg"))
    from reportlab.graphics import renderPM
    try:
        renderPM.drawToFile(drawing,str(SOCIAL/f"template-{kind}.png"),fmt="PNG")
    except Exception:
        # Render a temporary PDF, then convert using the bundled Poppler renderer.
        intermediate=proof/f"social-{kind}.pdf"
        renderPDF.drawToFile(drawing,str(intermediate))
        subprocess.run([renderer,"-scale-to-x","1080","-scale-to-y","-1","-singlefile","-png",str(intermediate),str(SOCIAL/f"template-{kind}")],check=True)

tokens={"colors":COLORS,"typography":{"family":"Manrope","weights":[400,500,600,700]},"logo":{"format":"SVG outlines","symbol":"m."}}
(ROOT/"tokens.json").write_text(json.dumps(tokens,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
css=":root {\n"+"".join(f"  --mila-{key}: {value};\n" for key,value in COLORS.items())+'  --mila-font: "Manrope", sans-serif;\n}\n'
(ROOT/"brand-tokens.css").write_text(css,encoding="utf-8")

readme="""# Identidade visual mila. - direção mineral

Para uma assistente de negócios de quem vende joias e semijoias. A identidade comunica clareza e confiança sem se confundir com a marca de uma joalheria.

Desenvolvida com Astra a partir da primeira logo escolhida pelo usuário.

- vectors/: logos e símbolo m. em SVG com curvas, sem fontes ou imagem embutida. Inclui o avatar mineral sobre branco solicitado.
- png/: arquivos transparentes e avatares para uso direto.
- social/: templates editáveis de post (1080x1350) e story (1080x1920), com PNGs de referência.
- fonts/: Manrope em 400, 500, 600 e 700; licença OFL incluída. Instalar para editar os templates.
- web/: favicon SVG, PNGs de 16/32/48/64 px, ICO e ícone de 180 px para dispositivos Apple.
- brand-tokens.css e tokens.json: especificação digital de cores e tipografia.
- ASTRA-DIRECTION.md: decisões e especificações da marca.
- identidade-mila-preview.png: visão geral.
- proposta-site.png: aplicação conceitual ao site; não é uma alteração publicada.
- guia-identidade-visual.pdf: guia com oito páginas.

O wordmark foi reconstruído em Bézier a partir da imagem aprovada, com refinamento óptico.
Os templates usam texto editável; os arquivos de logo são independentes de fontes.
Fonte oficial: https://github.com/google/fonts/tree/main/ofl/manrope
"""
(ROOT/"README.md").write_text(readme,encoding="utf-8")
shutil.copy2(PDF,ROOT/"guia-identidade-visual.pdf")
archive=ROOT.parent/"mila-ai-identidade-visual.zip"
with zipfile.ZipFile(archive,"w",zipfile.ZIP_DEFLATED) as z:
    for file in ROOT.rglob("*"):
        if file.is_file() and "preview" not in file.relative_to(ROOT).parts and file.name not in {"build_identity.py", ".DS_Store"}:
            z.write(file,Path("mila-ai-identidade-visual")/file.relative_to(ROOT))
print(json.dumps({"pdf":str(PDF),"zip":str(archive),"preview":str(ROOT/"identidade-mila-preview.png"),"contrast":contrast(MINERAL,IVORY)},ensure_ascii=False))

"""Add click-to-reveal 'Appear' entrances to shapes named 'a<N>:label' (N = click number). Mechanical, no easing."""
import re, shutil, sys, zipfile
from collections import defaultdict

src, dst = sys.argv[1], sys.argv[2]
NAME = re.compile(r'<p:cNvPr id="(\d+)" name="a(\d+):')


def timing(groups, text_ids):
    n = [2]

    def nid():
        n[0] += 1
        return n[0]

    clicks = ''
    for click in sorted(groups):
        effects = ''
        for k, spid in enumerate(groups[click]):
            kind = 'clickEffect' if k == 0 else 'withEffect'
            effects += (
                f'<p:par><p:cTn id="{nid()}" presetID="1" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="{kind}">'
                '<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                f'<p:set><p:cBhvr><p:cTn id="{nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
                f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
                '<p:to><p:strVal val="visible"/></p:to></p:set></p:childTnLst></p:cTn></p:par>'
            )
        outer, inner = nid(), nid()
        clicks += (
            f'<p:par><p:cTn id="{outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
            f'<p:par><p:cTn id="{inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{effects}</p:childTnLst></p:cTn></p:par>'
            '</p:childTnLst></p:cTn></p:par>'
        )
    bld = ''.join(f'<p:bldP spid="{i}" grpId="0" animBg="1"/>' for i in text_ids)
    bld = f'<p:bldLst>{bld}</p:bldLst>' if bld else ''
    return (
        '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
        '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
        f'{clicks}</p:childTnLst></p:cTn>'
        '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
        '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
        f'</p:childTnLst></p:cTn></p:par></p:tnLst>{bld}</p:timing>'
    )


total = 0
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.fullmatch(r'ppt/slides/slide\d+\.xml', item.filename):
            xml = data.decode('utf-8')
            groups, text_ids = defaultdict(list), []
            for m in re.finditer(r'<p:(sp|pic)>.*?</p:\1>', xml, re.S):
                nm = NAME.search(m.group(0))
                if nm:
                    groups[int(nm.group(2))].append(nm.group(1))
                    if m.group(1) == 'sp':
                        text_ids.append(nm.group(1))
            if groups:
                assert '<p:timing' not in xml
                xml = xml.replace('</p:sld>', timing(groups, text_ids) + '</p:sld>')
                total += sum(len(v) for v in groups.values())
            data = xml.encode('utf-8')
        zout.writestr(item, data)
print('animated shapes:', total)

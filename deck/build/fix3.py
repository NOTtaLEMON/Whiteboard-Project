s=open('build.js',encoding='utf-8').read()
def r(a,b):
    global s
    assert a in s, a
    s=s.replace(a,b,1)
r(r"T(s, 'THE WHITEBOARD THAT RUNS YOUR CODE.',", r"T(s, 'THE WHITEBOARD\nTHAT RUNS YOUR CODE.',")
r(r"star(s, 11.4, 0.3, 1.75,", r"star(s, 11.75, 0.1, 1.4,")
r(r"{ fontSize: 15, fontFace: MONO, valign: 'top', objectName: 'a5:error code' }", r"{ fontSize: 15, fontFace: MONO, valign: 'top', lineSpacing: 26, objectName: 'a5:error code' }")
r(r"x: 8.2, y: 5.78, w: 1.3, h: 0.05", r"x: 8.2, y: 5.8, w: 1.3, h: 0.05")
open('build.js','w',encoding='utf-8').write(s)

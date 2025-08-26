# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - heading "BlameGame" [level=1] [ref=e8] [cursor=pointer]
  - main [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - heading "Wem traust du was zu?" [level=1] [ref=e13]
          - paragraph [ref=e14]: Was denkst du? Wer würde was tun?
        - generic [ref=e15]:
          - button "Spiel starten" [ref=e16] [cursor=pointer]
          - generic [ref=e18] [cursor=pointer]:
            - switch "NameBlame Modus" [ref=e19] [cursor=pointer]
            - generic [ref=e20] [cursor=pointer]: NameBlame Modus
          - generic [ref=e22] [cursor=pointer]:
            - switch "Manuelle Kategorieauswahl" [ref=e23] [cursor=pointer]
            - generic [ref=e24] [cursor=pointer]: Manuelle Kategorieauswahl
        - generic [ref=e26]:
          - button "🔊" [ref=e27] [cursor=pointer]
          - slider [ref=e32]
        - generic [ref=e34]:
          - generic [ref=e35]: Sprache
          - combobox "Sprache" [ref=e36]:
            - option "Deutsch" [selected]
            - option "English"
            - option "Español"
            - option "Français"
        - generic [ref=e37]:
          - button [ref=e38] [cursor=pointer]:
            - img [ref=e39] [cursor=pointer]
          - button [ref=e42] [cursor=pointer]:
            - img [ref=e43] [cursor=pointer]
      - button "Show Debug Panel" [ref=e46] [cursor=pointer]: D
  - contentinfo
```
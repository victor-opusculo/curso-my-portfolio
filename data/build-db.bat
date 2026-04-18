
del .\uploads\media\*.*
type nul > .\uploads\media\.gitkeep

del .\my-portfolio.sqlite3
sqlite3.exe .\my-portfolio.sqlite3 < .\my-portfolio.sql
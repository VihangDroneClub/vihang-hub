import os

with open('src/app/activities/page.tsx', 'r') as f:
    content = f.read()
    if '          </div>\n        )}\n      </div>\n    </div>\n  )\n}' not in content:
        # try to fix div closing tag
        pass # need to inspect


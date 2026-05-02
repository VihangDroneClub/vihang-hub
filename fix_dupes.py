import os

files = [
    'src/app/activities/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/components/projects/KanbanBoard.tsx'
]

# For activities/page.tsx
with open('src/app/activities/page.tsx', 'r') as f:
    content = f.read()
    idx = content.find('          </div>\n            </CardContent>')
    if idx != -1:
        content = content[:idx] + '\n'
        with open('src/app/activities/page.tsx', 'w') as out:
            out.write(content)

# For dashboard/page.tsx
with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()
    idx = content.find('iv>\n      </section>')
    if idx != -1:
        content = content[:idx] + '\n'
        with open('src/app/dashboard/page.tsx', 'w') as out:
            out.write(content)

# For KanbanBoard.tsx
with open('src/components/projects/KanbanBoard.tsx', 'r') as f:
    content = f.read()
    content = content.replace("initialTasks: any[]", "initialTasks: { id: string, status: string, [key: string]: unknown }[]")
    
    # remove useEffect block
    import re
    content = re.sub(r'  useEffect\(\(\) => \{\n    setTasks\(initialTasks\)\n  \}, \[initialTasks\]\)\n\n', '', content)
    
    # replace destination.droppableId as any
    content = content.replace("destination.droppableId as any", "destination.droppableId as string")
    
    # remove unused oldStatus
    content = content.replace("const oldStatus = movedTask.status\n", "")
    
    # fix catch(error) unused
    content = content.replace("catch (error) {", "catch {")

    with open('src/components/projects/KanbanBoard.tsx', 'w') as out:
        out.write(content)

print("Dupes fixed")

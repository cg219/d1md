# d1md
## Day One Journal Export to Markdown
Converts a Day One Journal Export to Markdown files with frontmatter

### Prereqs
Deno: >1.40.0

### Build
`deno task build`

### Usage
Run in directory you would like the output in

`cat ~/Downloads/DayOneFolderExport/Journal\ 2.json | deno task dev -r ~/Downloads/DayOneFolderExport/`
`cat ~/Downloads/DayOneFolderExport/Journal\ 2.json | ./bin/dlmd -r ~/Downloads/DayOneFolderExport/`

### Troubleshooting


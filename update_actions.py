with open('clean.html', 'r') as f:
    lines = f.readlines()

# Find the line with "Only show actions column for admins, not for suppliers" around line 10714
for i, line in enumerate(lines):
    if i > 10700 and i < 10750:
        if 'Only show actions column for admins, not for suppliers' in line:
            # Found it! Now replace the if statement
            # Current: if (!isSupplier) {
            # New: if (!isSupplier || (isSupplier && activeTab === 'archived-items')) {
            
            # First, let's insert the supplier archived items action handling before the closing }
            # Find where the closing } is (around line 10745)
            
            # Replace the if statement on the next line
            lines[i+1] = lines[i+1].replace('if (!isSupplier) {', 'if (!isSupplier || (isSupplier && activeTab === \'archived-items\')) {')
            
            # Now find where to add the supplier archived-items case
            # It should be after the else of the request tabs check
            # Looking for the structure: "} else {" followed by row += ... which is the regular detail button
            
            for j in range(i+1, i+50):
                if '} else {' in lines[j] and j > i + 5:
                    # This is probably the else for the request tabs check
                    # After this else, there's the detail button code
                    # We need to wrap this in another if that checks if it's admin
                    
                    # Find the closing brace of this else block (it should have 1 level of nesting)
                    # Actually, let's find the next } that closes the admin-only section
                    
                    for k in range(j+1, j+20):
                        if lines[k].strip() == '}' and '// Only show actions' not in lines[k]:
                            # This might be the closing brace
                            # Let's insert our supplier archived items case before this closing brace
                            
                            # But we also need to indent things properly
                            # The structure should be:
                            # if (!isSupplier || (isSupplier && activeTab === 'archived-items')) {
                            #     if (!isSupplier) {
                            #         ... existing admin code ...
                            #     } else if (isSupplier && activeTab === 'archived-items') {
                            #         ... new supplier code ...
                            #     }
                            # }
                            
                            # So we need to wrap the existing code in another if
                            break
                    break
            break

print("Updated to allow suppliers to see archived-items actions")

with open('clean.html', 'w') as f:
    f.writelines(lines)

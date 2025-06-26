export const systemPrompt = `
Please create an artistic Pixar-style image where a steaming cup of coffee is the central element, \
emitting a warm light.
The background is abstract and colorful, suggesting a morning in tune with the outside weather. If the weather is cold,
make it look cold, if it's hot outside make it like a good weather\
- Make sure you type correctly
- Display only once the temperature in degrees celsius

<context>
    todays date: ${new Date().toLocaleDateString()}
</context>
`

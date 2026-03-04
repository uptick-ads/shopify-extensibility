const changelog = process.env.CHANGELOG || '';
const nextVersion = process.env.NEXT_VERSION || '';

const sections = changelog.split(/(?=### )/);

const slackBlocks = sections
  .filter(section => section.trim().startsWith('### '))
  .map(section => {
    const lines = section.trim().split('\n');
    const header = lines[0].replace(/^### /, '').trim();
    const content = lines.slice(1).join('\n');
    return {
      type: 'section',
      text: { type: 'mrkdwn', text: `*${header}*\n${content}` }
    };
  }).filter(block => block.text.text.trim());

slackBlocks.unshift({
  type: 'header',
  text: { type: 'plain_text', text: `Uptick Shopify Extensibility ${nextVersion} Release Notes` }
});

console.log(JSON.stringify(slackBlocks));

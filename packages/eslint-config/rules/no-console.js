export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow console.log usage',
      category: 'Possible Errors',
      recommended: true
    },
    schema: []
  },

  create(context) {
    return {
      'CallExpression[callee.object.name="console"][callee.property.name="log"]': (node) => {
        context.report({
          node,
          message: 'Avoid using console.log'
        });
      }
    };
  }
};

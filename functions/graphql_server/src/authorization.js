const { ForbiddenError } = require('apollo-server');
const { skip } = require('graphql-resolvers');

/**
 * Check if user is authorized.
 */
module.exports.isAuthenticated = (_, __, { me }) =>
  (me ? skip : new ForbiddenError('User is not login'));

/**
 * if user want to modify the tag, check if user is the tag Owner.
 */
module.exports.isTagOwner = (_, { data }, { me, dataSources }) => {
  if (data.modify) {
    const { createUser } = dataSources
      .firestoreAPI.getTagCreateUser({ tagID: data.id });
    if (createUser !== me.uid) {
      const errMsg = 'Can not change the tag. Not authenticated as owner';
      throw new ForbiddenError(errMsg);
    }
  }
  return skip;
};

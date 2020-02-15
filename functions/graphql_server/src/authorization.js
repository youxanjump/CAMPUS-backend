/** @module authorization */
const { ForbiddenError } = require('apollo-server');
const { skip } = require('graphql-resolvers');

/**
 * A resover. Check if user is authorized.
 * Use `combineResolvers` in `graphql-resolvers` to combine
 * with other resolvers.
 * @todo Understand why returning error instance will work.
 * reference: 
 * https://www.apollographql.com/docs/graphql-tools/resolvers/#graphql-resolvers
 * https://www.robinwieruch.de/graphql-apollo-server-tutorial#authorization-with-graphql-and-apollo-server
 * @returns {undefined} skip, go to executute next resolvers.
 * If not login, return ForbiddenError forbid not login users
 */
module.exports.isAuthenticated = (_, __, { me }) =>
  (me ? skip : new ForbiddenError('User is not login'));

/**
 * A resover. If user want to modify the tag, check if user is the tag Owner.
 * Use `combineResolvers` in `graphql-resolvers` to combine
 * with other resolvers.
 * @returns {undefined} skip, go to executute next resolvers
 * @throws {ForbiddenError} forbid not authorize users
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

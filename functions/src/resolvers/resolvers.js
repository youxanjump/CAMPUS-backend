const { merge } = require('lodash');
const {
  queryResolvers,
  mutationResolvers,
  tagResolvers,
  tagdetailResolvers,
  statusResolvers,
  userResolvers,
  missionResolver,
  discoveryResolvers,
  coordinateResolvers,
} = require('./map_resolvers');

const resolvers = merge(
  queryResolvers,
  mutationResolvers,
  tagResolvers,
  tagdetailResolvers,
  statusResolvers,
  userResolvers,
  missionResolver,
  discoveryResolvers,
  coordinateResolvers
);

console.log(resolvers);

module.exports = resolvers;

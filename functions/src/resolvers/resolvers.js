const { merge } = require('lodash');

const {
  tagResolvers,
  statusResolvers,
  userResolvers,
  missionResolver,
  discoveryResolvers,
  coordinateResolvers,
} = require('./map_resolvers');

const queryResolvers = {
  Query: {
    tagRenderList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getTagList(),
    tag: async (_, { id }, { dataSources }) =>
      dataSources.firebaseAPI.getTagData({ id }),
    userAddTagHistory: async (_, { uid }, { dataSources }) =>
      dataSources.firebaseAPI.getUserAddTagHistory({ uid }),
    missionList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getList('missionList'),
    discoveryList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getList('discoveryList'),
    intentAnswer: async (_, { intent }, { dataSources }) =>
      dataSources.firebaseAPI.getAnswer(intent),
  },
};

const mutationResolvers = {
  Mutation: {
    addNewTagData: async (_, { data }, { dataSources, userInfo }) => {
      return dataSources.firebaseAPI.addNewTagData({ data, userInfo });
    },
    tagDataUpdate: async (_, { tagId, data }, { dataSources, userInfo }) => {
      return dataSources.firebaseAPI.updateTagData({ tagId, data, userInfo });
    },
    updateTagStatus: async (
      _,
      { tagId, statusName, description },
      { dataSources, userInfo }
    ) => {
      return dataSources.firebaseAPI.updateTagStatus({
        tagId,
        statusName,
        description,
        userInfo,
      });
    },
    addNewIntent: (_, { userIntent, userAnswer }, { dataSources }) => {
      return dataSources.firebaseAPI.addNewIntent({ userIntent, userAnswer });
    },
    updateUpVoteStatus: async (
      _,
      { tagId, action },
      { dataSources, userInfo }
    ) =>
      dataSources.firebaseAPI.updateNumberOfUpVote({ tagId, action, userInfo }),
  },
};

const resolvers = merge(
  queryResolvers,
  mutationResolvers,
  tagResolvers,
  statusResolvers,
  userResolvers,
  missionResolver,
  discoveryResolvers,
  coordinateResolvers
);

module.exports = resolvers;

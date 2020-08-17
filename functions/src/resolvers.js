const { combineResolvers } = require('graphql-resolvers');

// const { isAuthenticated, isTagOwner } = require('./authorization');

module.exports = {
  Query: {
    tagRenderList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getTagList(),
    tagDetail: async (_, { id }, { dataSources }) =>
      dataSources.firebaseAPI.getTagDetail({ tagID: id }),
    missionList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getList('missionList'),
    discoveryList: async (_, __, { dataSources }) =>
      dataSources.firebaseAPI.getList('discoveryList'),
  },
  Mutation: {
    addNewTagData: combineResolvers(
      // isAuthenticated,
      // isTagOwner,
      async (_, { data }, { dataSources, me }) => {
        return dataSources.firebaseAPI.addNewTagData({ data, me });
      }
    ),
    updateTagStatus: async (_, { tagId, statusName }, { dataSources }) => {
      return dataSources.firebaseAPI.updateTagStatus({ tagId, statusName });
    },
  },
  Tag: {
    tagDetail: async (tag, _, { dataSources }) =>
      dataSources.firebaseAPI.getTagDetail({ tagID: tag.id }),
  },
  TagDetail: {
    createTime: async (tagDetail, _, __) =>
      tagDetail.createTime.toDate().toString(),
    lastUpdateTime: async (tagDetail, _, __) =>
      tagDetail.lastUpdateTime.toDate().toString(),
    createUser: async (tagDetail, _, __) => tagDetail.createUserID,
  },
  Status: {
    createTime: async (status, _, __) => status.createTime.toDate().toString(),
  },
  User: {
    id: async (userId, _, __) => userId,
    name: async (userId, _, { dataSources }) =>
      dataSources.firebaseAPI.getUserName({ uid: userId }),
  },
  Mission: {
    discoveries: async (mission, _, { dataSources }) =>
      dataSources.firebaseAPI.getDiscoveriesOfAMission({
        missionID: mission.id,
      }),
  },
  Discovery: {
    mission: async (discovery, _, { dataSources }) =>
      dataSources.firebaseAPI.getMissionById({ id: discovery.missionID }),
  },
  Coordinate: {
    latitude: async (coordinates, _, __) => coordinates.latitude.toString(),
    longitude: async (coordinates, _, __) => coordinates.longitude.toString(),
  },
};

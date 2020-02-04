module.exports = {
  Query: {
    tagRenderList: async (_, __, { dataSources }) =>
      dataSources.firestoreAPI.getTagList(),
    tagDetail: async (_, { id }, { dataSources }) =>
      dataSources.firestoreAPI.getTagDetail({ tagID: id }),
    missionList: async (_, __, { dataSources }) =>
      dataSources.firestoreAPI.getMissionList(),
    discoveryList: async (_, __, { dataSources }) =>
      dataSources.firestoreAPI.getDiscoveryList(),
  },
  Mutation: {
    tagUpdate: async (_, { data }, { dataSources }) =>
      dataSources.firestoreAPI.updateTagData({ data }),
  },
  Tag: {
    tagDetail: async (tag, _, { dataSources }) =>
      dataSources.firestoreAPI.getTagDetail({ tagID: tag.id }),
    mission: async (tag, _, { dataSources }) =>
      dataSources.firestoreAPI.getMissionById({ id: tag.missionID }),
    discoveries: async (tag, _, { dataSources }) =>
      dataSources.firestoreAPI.getDiscoveriesById({ ids: tag.discoveryIDs }),
  },
  TagDetail: {
    createTime: async (tagDetail, _, __) =>
      tagDetail.createTime.toDate().toString(),
    lastUpdateTime: async (tagDetail, _, __) =>
      tagDetail.lastUpdateTime.toDate().toString(),
    createUser: async (tagDetail, _, __) =>
      tagDetail.createUserID,
  },
  User: {
    id: async (userId, _, __) =>
      userId,
    name: async (userId, _, { dataSources }) =>
      dataSources.firestoreAPI.getUserName({ uid: userId }),
  },
  Mission: {
    discoveries: async (mission, _, { dataSources }) =>
      dataSources.firestoreAPI.getDiscoveriesOfAMission({ missionID: mission.id }),
  },
  Discovery: {
    mission: async (discovery, _, { dataSources }) =>
      dataSources.firestoreAPI.getMissionById({ id: discovery.missionID }),
  },
  Coordinate: {
    latitude: async (coordinates, _, __) => 
      coordinates.latitude.toString(),
    longitude: async (coordinates, _, __) =>
      coordinates.longitude.toString(),
  }
};

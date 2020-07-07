const { gql } = require('apollo-server');

const queryTagRenderList = gql`
  query {
    tagRenderList {
      id
      title
      accessibility
      mission {
        id
        name
      }
      discoveries {
        id
        name
      }
      coordinates {
        latitude
        longitude
      }
    }
  }
`;

const queryDetail = gql`
  query {
    tagDetail(id: "tPCxYUvebm26xaAYc4lG") {
      tagID
      createTime
      lastUpdateTime
      createUser {
        id
      }
      location {
        geoInfo
      }
      description
      imageUrl
    }
  }
`;

const queryMissionList = gql`
  query {
    missionList {
      id
      name
      discoveries {
        id
        name
      }
    }
  }
`;

const queryDiscoveryList = gql`
  query {
    discoveryList {
      id
      missionID
      name
    }
  }
`;

const { gql } = require('apollo-server');

const typeDefs = gql`
  # schema definition
  scalar JSON

  type Query {
    tagRenderList: [Tag]
    tagDetail(id: ID!): TagDetail
    missionList: [Mission]
    discoveryList: [Discovery]
  }

  type Tag {
    id: ID!
    title: String
    accessibility: Float
    mission: Mission
    discoveries: [Discovery]
    coordinates: Coordinate
    tagDetail: TagDetail
  }

  type TagDetail {
    tagID: ID!
    createTime: String
    lastUpdateTime: String
    createUser: User
    location: Location
    description: String
    imageUrl: [String]
  }

  type User{
    id: ID!
    name: String
  }

  type Location {
      geoInfo: JSON # import json type
  }

  type Coordinate {
    latitude: String!
    longitude: String!
  }

  type Mission {
      id: ID!
      name: String
      discoveries: [Discovery]
  }

  type Discovery {
      id: ID!
      mission: Mission
      name: String
  }

  # mutation
  type Mutation {
    tagUpdate(data: TagUpdateInput!): TagUpdateResponse!
  }

  input TagUpdateInput {
    id: ID #set null if we want to create new data
    "true if modifing existing tag; false if creaing new tag"
    modify: Boolean!
    title: String
    accessibility: Float
    missionID: String
    discoveryIDs: [String]
    coordinates: CoordinateInput
    createUserID: String
    description: String
    imageUrl: [String]!
  }

  input CoordinateInput {
    latitude: String
    longitude: String
  }

  type TagUpdateResponse {
    success: Boolean!
    message: String
    tag: Tag
  }
`;

module.exports = typeDefs;

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

  type User {
    id: ID!
    name: String
    email: String
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
    #tagUpdate(data: TagUpdateInput!): TagUpdateResponse!
    #tagImageUrlAdd(id: ID, imageUrl: [String]!): TagDetail!
    addNewTagData(data: AddNewTagDataInput!): TagImageUpload
  }

  type TagImageUpload {
    tag: Tag!
    imageNumber: Int!
    imageUploadUrl: [String]!
  }

  input TagUpdateInput {
    "set null if we want to create new data"
    id: ID
    "true if modifing existing tag; false if creaing new tag"
    modify: Boolean!
    title: String
    accessibility: Float
    missionID: String
    discoveryIDs: [String]
    coordinates: CoordinateInput
    description: String
  }

  input AddNewTagDataInput {
    title: String
    accessibility: Float
    missionID: String
    discoveryIDs: [String]
    coordinates: CoordinateInput
    description: String
    imageNumber: Int
  }

  input CoordinateInput {
    latitude: String
    longitude: String
  }
`;

module.exports = typeDefs;

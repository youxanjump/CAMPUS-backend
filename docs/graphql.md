## Modules

<dl>
<dt><a href="#module_authorization">authorization</a></dt>
<dd></dd>
<dt><a href="#module_src/index">src/index</a></dt>
<dd></dd>
<dt><a href="#module_Firebase">Firebase</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#getImageUploadUrls">getImageUploadUrls(imageNumber, tagID)</a> ⇒ <code>Array.&lt;Promise&gt;</code></dt>
<dd><p>Generate Singed URL to let front end upload images in a tag to firebase storage
The file name on the storage will looks like: <code>tagID/(8 digits uuid)</code>
reference from: <a href="https://github.com/googleapis/nodejs-storage/blob/master/samples/generateV4UploadSignedUrl.js">https://github.com/googleapis/nodejs-storage/blob/master/samples/generateV4UploadSignedUrl.js</a></p>
</dd>
</dl>

<a name="module_authorization"></a>

## authorization

* [authorization](#module_authorization)
    * [.isAuthenticated()](#module_authorization.isAuthenticated) ⇒ <code>undefined</code> \| <code>ForbiddenError</code>
    * [.isTagOwner()](#module_authorization.isTagOwner) ⇒ <code>undefined</code>

<a name="module_authorization.isAuthenticated"></a>

### authorization.isAuthenticated() ⇒ <code>undefined</code> \| <code>ForbiddenError</code>
A resover. Check if user is authorized.
Use `combineResolvers` in `graphql-resolvers` to combine
with other resolvers.
`combineResolvers`: combine a sequence of resolver.
If it return `skip`(`undefined`), go to next resolver.
Otherwise, the resolver return and ignore all the other resolvers.

**Kind**: static method of [<code>authorization</code>](#module_authorization)  
**Returns**: <code>undefined</code> \| <code>ForbiddenError</code> - skip, go to executute next resolvers.
If not login, return ForbiddenError forbid not login users  
<a name="module_authorization.isTagOwner"></a>

### authorization.isTagOwner() ⇒ <code>undefined</code>
A resover. If user want to modify the tag, check if user is the tag Owner.
Use `combineResolvers` in `graphql-resolvers` to combine
with other resolvers.
`combineResolvers`: combine a sequence of resolver.
If it return `skip`(`undefined`), go to next resolver.
Otherwise, the resolver return and ignore all the other resolvers.

**Kind**: static method of [<code>authorization</code>](#module_authorization)  
**Returns**: <code>undefined</code> - skip, go to executute next resolvers  
**Throws**:

- <code>ForbiddenError</code> forbid not authorize users

<a name="module_src/index"></a>

## src/index
<a name="module_src/index..apolloServer"></a>

### src/index~apolloServer({admin}) ⇒ <code>ApolloServer</code>
Apollo server instance

**Kind**: inner method of [<code>src/index</code>](#module_src/index)  
**Returns**: <code>ApolloServer</code> - ApolloServer with config  

| Param | Type | Description |
| --- | --- | --- |
| {admin} | <code>object</code> | firebase admin SDK |

<a name="module_Firebase"></a>

## Firebase

* [Firebase](#module_Firebase)
    * [~FirebaseAPI](#module_Firebase..FirebaseAPI)
        * [new FirebaseAPI(param)](#new_module_Firebase..FirebaseAPI_new)
        * [.initialize()](#module_Firebase..FirebaseAPI+initialize)
        * [.getToken(req)](#module_Firebase..FirebaseAPI+getToken) ⇒ <code>DecodedIdToken</code>
        * [.getList(collectionName)](#module_Firebase..FirebaseAPI+getList) ⇒ <code>Array.&lt;object&gt;</code>
        * [.getTagList()](#module_Firebase..FirebaseAPI+getTagList) ⇒ <code>object</code>
        * [.getTagDetail(param)](#module_Firebase..FirebaseAPI+getTagDetail) ⇒ <code>object</code> \| <code>null</code>
        * [.getMissionById(param)](#module_Firebase..FirebaseAPI+getMissionById) ⇒ <code>missionObject</code>
        * [.getDiscoveriesById(param)](#module_Firebase..FirebaseAPI+getDiscoveriesById) ⇒ <code>Array.&lt;discoveryObject&gt;</code>
        * [.getDiscoveriesOfAMission(param)](#module_Firebase..FirebaseAPI+getDiscoveriesOfAMission) ⇒ <code>Array.&lt;discoveryObject&gt;</code>
        * [.getUserName(the)](#module_Firebase..FirebaseAPI+getUserName) ⇒ <code>string</code>
        * [.addNewTagDetailData(param)](#module_Firebase..FirebaseAPI+addNewTagDetailData) ⇒ <code>undefined</code>
        * [.addNewTagData(param)](#module_Firebase..FirebaseAPI+addNewTagData) ⇒ <code>AddNewTagResponse</code>

<a name="module_Firebase..FirebaseAPI"></a>

### Firebase~FirebaseAPI
Handle action with firebase

**Kind**: inner class of [<code>Firebase</code>](#module_Firebase)  
**Todo**

- [ ] Rewrite this class name
- [ ] refactor


* [~FirebaseAPI](#module_Firebase..FirebaseAPI)
    * [new FirebaseAPI(param)](#new_module_Firebase..FirebaseAPI_new)
    * [.initialize()](#module_Firebase..FirebaseAPI+initialize)
    * [.getToken(req)](#module_Firebase..FirebaseAPI+getToken) ⇒ <code>DecodedIdToken</code>
    * [.getList(collectionName)](#module_Firebase..FirebaseAPI+getList) ⇒ <code>Array.&lt;object&gt;</code>
    * [.getTagList()](#module_Firebase..FirebaseAPI+getTagList) ⇒ <code>object</code>
    * [.getTagDetail(param)](#module_Firebase..FirebaseAPI+getTagDetail) ⇒ <code>object</code> \| <code>null</code>
    * [.getMissionById(param)](#module_Firebase..FirebaseAPI+getMissionById) ⇒ <code>missionObject</code>
    * [.getDiscoveriesById(param)](#module_Firebase..FirebaseAPI+getDiscoveriesById) ⇒ <code>Array.&lt;discoveryObject&gt;</code>
    * [.getDiscoveriesOfAMission(param)](#module_Firebase..FirebaseAPI+getDiscoveriesOfAMission) ⇒ <code>Array.&lt;discoveryObject&gt;</code>
    * [.getUserName(the)](#module_Firebase..FirebaseAPI+getUserName) ⇒ <code>string</code>
    * [.addNewTagDetailData(param)](#module_Firebase..FirebaseAPI+addNewTagDetailData) ⇒ <code>undefined</code>
    * [.addNewTagData(param)](#module_Firebase..FirebaseAPI+addNewTagData) ⇒ <code>AddNewTagResponse</code>

<a name="new_module_Firebase..FirebaseAPI_new"></a>

#### new FirebaseAPI(param)
Use admin to construct necessary entity of communication


| Param | Type | Description |
| --- | --- | --- |
| param | <code>object</code> |  |
| param.admin | <code>object</code> | firebase admin config |

<a name="module_Firebase..FirebaseAPI+initialize"></a>

#### firebaseAPI.initialize()
This is a function that gets called by ApolloServer when being setup.
This function gets called with the datasource config including things
like caches and context. We'll assign this.context to the request context
here, so we can know about the user making requests

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
<a name="module_Firebase..FirebaseAPI+getToken"></a>

#### firebaseAPI.getToken(req) ⇒ <code>DecodedIdToken</code>
get token from reqeust header and verify

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
**Returns**: <code>DecodedIdToken</code> - - have `uid` properity which specify
 the uid of the user.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | request |

<a name="module_Firebase..FirebaseAPI+getList"></a>

#### firebaseAPI.getList(collectionName) ⇒ <code>Array.&lt;object&gt;</code>
Get all objects from specific collection.

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
**Returns**: <code>Array.&lt;object&gt;</code> - Array of document data in the collection `collectionName`  

| Param | Type | Description |
| --- | --- | --- |
| collectionName | <code>string</code> | Collection name of firestore. |

<a name="module_Firebase..FirebaseAPI+getTagList"></a>

#### firebaseAPI.getTagList() ⇒ <code>object</code>
Geofirestore will store not geo-related data in field `d`.
This function get field `d` data from collection `tagData`

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
**Returns**: <code>object</code> - Object with id and `d` unpacked data of document
in collection `tagData`  
<a name="module_Firebase..FirebaseAPI+getTagDetail"></a>

#### firebaseAPI.getTagDetail(param) ⇒ <code>object</code> \| <code>null</code>
get tag detail from collection `tag_detail`

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
**Returns**: <code>object</code> \| <code>null</code> - Object of document data in collection `tagDetail`  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>object</code> |  |
| param.tagID | <code>string</code> | tagID of the document with detailed info. |

<a name="module_Firebase..FirebaseAPI+getMissionById"></a>

#### firebaseAPI.getMissionById(param) ⇒ <code>missionObject</code>
get mission detail with specific id

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
**Returns**: <code>missionObject</code> - mission data  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>object</code> |  |
| param.id | <code>string</code> | get mission data of the id |

<a name="module_Firebase..FirebaseAPI+getDiscoveriesById"></a>

#### firebaseAPI.getDiscoveriesById(param) ⇒ <code>Array.&lt;discoveryObject&gt;</code>
get discovery detail with specific id

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
**Returns**: <code>Array.&lt;discoveryObject&gt;</code> - Array of discovery data  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>object</code> |  |
| param.ids | <code>Array.&lt;string&gt;</code> | Array of discovery id |

<a name="module_Firebase..FirebaseAPI+getDiscoveriesOfAMission"></a>

#### firebaseAPI.getDiscoveriesOfAMission(param) ⇒ <code>Array.&lt;discoveryObject&gt;</code>
get all discovery belong to specific mission
from collection `discoveryList`.

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  

| Param | Type |
| --- | --- |
| param | <code>object</code> | 
| param.missionID | <code>string</code> | 

<a name="module_Firebase..FirebaseAPI+getUserName"></a>

#### firebaseAPI.getUserName(the) ⇒ <code>string</code>
Get user's name from uid

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
**Returns**: <code>string</code> - user's name of the uid  

| Param | Type | Description |
| --- | --- | --- |
| the | <code>uid</code> | uid of the user |

<a name="module_Firebase..FirebaseAPI+addNewTagDetailData"></a>

#### firebaseAPI.addNewTagDetailData(param) ⇒ <code>undefined</code>
Add tag detail data to collection `tagDetailData`

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>object</code> |  |
| param.tagID | <code>String</code> | the id of the tag |
| param.detailFromTagData | <code>object</code> | contain the necessary filed should  be added to tagDetail document |

<a name="module_Firebase..FirebaseAPI+addNewTagData"></a>

#### firebaseAPI.addNewTagData(param) ⇒ <code>AddNewTagResponse</code>
Add or update tag data. Currently not implement updata function.

**Kind**: instance method of [<code>FirebaseAPI</code>](#module_Firebase..FirebaseAPI)  
**Returns**: <code>AddNewTagResponse</code> - Contain the upload tag information, and image
 upload Urls.  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>object</code> |  |
| param.data | <code>AddNewTagDataInputObject</code> | `AddNewTagDataInput` data |
| param.me | <code>DecodedIdToken</code> | have `uid` properity which specify  the uid of the user. |

<a name="getImageUploadUrls"></a>

## getImageUploadUrls(imageNumber, tagID) ⇒ <code>Array.&lt;Promise&gt;</code>
Generate Singed URL to let front end upload images in a tag to firebase storage
The file name on the storage will looks like: `tagID/(8 digits uuid)`
reference from: https://github.com/googleapis/nodejs-storage/blob/master/samples/generateV4UploadSignedUrl.js

**Kind**: global function  
**Returns**: <code>Array.&lt;Promise&gt;</code> - an array contain singed urls with length `imageNumber`  

| Param | Type |
| --- | --- |
| imageNumber | <code>Int</code> | 
| tagID | <code>String</code> | 


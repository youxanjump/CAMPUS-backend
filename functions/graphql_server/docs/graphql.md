## Classes

<dl>
<dt><a href="#FirestoreAPI">FirestoreAPI</a></dt>
<dd><p>Handle action with firebase</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#isAuthenticated">isAuthenticated()</a></dt>
<dd><p>Check if user is authorized.</p>
</dd>
<dt><a href="#isTagOwner">isTagOwner()</a></dt>
<dd><p>if user want to modify the tag, check if user is the tag Owner.</p>
</dd>
</dl>

<a name="FirestoreAPI"></a>

## FirestoreAPI
Handle action with firebase

**Kind**: global class  
**Todo**

- [ ] Rewrite this class name
- [ ] refactor


* [FirestoreAPI](#FirestoreAPI)
    * [new FirestoreAPI({admin})](#new_FirestoreAPI_new)
    * [.initialize()](#FirestoreAPI+initialize)
    * [.getToken(req)](#FirestoreAPI+getToken) ⇒ <code>DecodedIdToken</code>
    * [.getList(collectionName)](#FirestoreAPI+getList)
    * [.getTagList()](#FirestoreAPI+getTagList)
    * [.getTagDetail(tagID)](#FirestoreAPI+getTagDetail)
    * [.getTagCreateUser(tagID)](#FirestoreAPI+getTagCreateUser)
    * [.getMissionList()](#FirestoreAPI+getMissionList)
    * [.getMissionById()](#FirestoreAPI+getMissionById)
    * [.getDiscoveryList()](#FirestoreAPI+getDiscoveryList)
    * [.getDiscoveriesById()](#FirestoreAPI+getDiscoveriesById)
    * [.getDiscoveriesOfAMission()](#FirestoreAPI+getDiscoveriesOfAMission)

<a name="new_FirestoreAPI_new"></a>

### new FirestoreAPI({admin})
Use admin to construct necessary entity of communication


| Param | Type | Description |
| --- | --- | --- |
| {admin} | <code>object</code> | firebase admin config |

<a name="FirestoreAPI+initialize"></a>

### firestoreAPI.initialize()
This is a function that gets called by ApolloServer when being setup.
This function gets called with the datasource config including things
like caches and context. We'll assign this.context to the request context
here, so we can know about the user making requests

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  
<a name="FirestoreAPI+getToken"></a>

### firestoreAPI.getToken(req) ⇒ <code>DecodedIdToken</code>
get token from reqeust header and verify

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  
**Returns**: <code>DecodedIdToken</code> - - have `uid` properity which specify
 the uid of the user.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | request |

<a name="FirestoreAPI+getList"></a>

### firestoreAPI.getList(collectionName)
get all objects from specific collection

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  

| Param | Type | Description |
| --- | --- | --- |
| collectionName | <code>string</code> | Collection name of firestore. |

<a name="FirestoreAPI+getTagList"></a>

### firestoreAPI.getTagList()
get all tags from collection "tag_data"

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  
<a name="FirestoreAPI+getTagDetail"></a>

### firestoreAPI.getTagDetail(tagID)
get tag detail from collection "tag_detail"

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  

| Param | Type | Description |
| --- | --- | --- |
| tagID | <code>string</code> | tagID of the document with detailed info. |

<a name="FirestoreAPI+getTagCreateUser"></a>

### firestoreAPI.getTagCreateUser(tagID)
get tag createUser"

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  

| Param | Type | Description |
| --- | --- | --- |
| tagID | <code>string</code> | tagID of the document with detailed info. |

<a name="FirestoreAPI+getMissionList"></a>

### firestoreAPI.getMissionList()
get all mission from collection "mission_list"

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  
<a name="FirestoreAPI+getMissionById"></a>

### firestoreAPI.getMissionById()
get mission detail with specific id

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  
<a name="FirestoreAPI+getDiscoveryList"></a>

### firestoreAPI.getDiscoveryList()
get all mission from collection "discovery_list"

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  
<a name="FirestoreAPI+getDiscoveriesById"></a>

### firestoreAPI.getDiscoveriesById()
get discovery detail with specific id

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  
<a name="FirestoreAPI+getDiscoveriesOfAMission"></a>

### firestoreAPI.getDiscoveriesOfAMission()
get all mission from collection "discovery_list"

**Kind**: instance method of [<code>FirestoreAPI</code>](#FirestoreAPI)  
<a name="isAuthenticated"></a>

## isAuthenticated()
Check if user is authorized.

**Kind**: global function  
<a name="isTagOwner"></a>

## isTagOwner()
if user want to modify the tag, check if user is the tag Owner.

**Kind**: global function  

# scuttle-tag

Tag reading and manipulation plugin for [secure scuttlebutt](https://github.com/ssbc/secure-scuttlebutt).

`gives` observables and async methods for getting and publishing tags on secure scuttlebutt.

## Dependencies

`ssb-backlinks` must be installed in your server


## Message Schema

```js
{
  type: 'tag',
  tagged: true | false,
  message: %msg_id, // the message being tagged
  root: %tag_id, // unless this is original message for this tag
  branch: %tag_id | [%tag_id_a, %tag_id_b, ...] // only required if root present
}
```

## Instantiate

```js
var TagHelper = require('scuttle-tag')
var tag = TagHelper(server)
```

where `server` is a scuttlebutt server, ssb-client instance, or an observeable which will resolve to one of these!

## API

### tag.async.create({}, cb)

Creates a new tag message and calls cb when done.

### tag.async.apply({ tag, message, tagged }, cb)

Creates a new tag message which applies the tag `tag` to the message `message` if `tagged` is `true`. (TODO: default tagged to true)

- `tag` (required) - id of tag being applied
- `message` (required) - id of message being tagged
- `tagged` (required) - `true` if tag is being added, `false` if tag is being removed

### tag.async.name({ tag, name }, cb)

Sets the name of a tag and calls cb when done.

- `tag` (required) - id of tag being named
- `name` (required) - name being applied to the tag

### tag.html.edit({ msgId }, cb)

Renders html which allows the tags applied to a message `msgId` to be edited.

### tag.html.tag({ tagName, tagId }, handleRemove)

Renders a tag. If the `handleRemove` function is specified then a remove button will be rendered.

### tag.obs.tag(tagId)

Returns a [Mutant](https://github.com/mmckegg/mutant) observable Struct which represents a tag. This struct holds the `tagId` and `tagName`.

### tag.obs.taggedMessages(author, tagId)

Returns a Mutant observable array of ids of messages. This array is messages that have had the tag `tagId` applied by `author`.

### tag.obs.messageTags(msgId)

Returns a Mutant observable list of tagIds which have been applied to the message `msgId`.

### tag.obs.messageTagsFrom(msgId, author)

Returns a Mutant observable list of tagIds which have been applied to the message `msgId` by the specified `author`.

### tag.obs.allTagsFrom(author)

Returns a Mutant observable array of all tag messages published by an user.

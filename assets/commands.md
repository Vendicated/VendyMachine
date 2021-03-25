# EmoteBot Command List

You can find a list of all commands below. For more info, simply click on the desired command!

- [Emotes](#Emotes)
  - [download](#download)
  - [emoji](#emoji)
  - [emojiinfo](#emojiinfo)
- [Misc](#Misc)
  - [about](#about)
  - [help](#help)
  - [ping](#ping)
- [Settings](#Settings)
  - [prefixes](#prefixes)
  - [setprefix](#setprefix)

---

## Emotes

#### download

_Export emotes as zip_

Guild only: No

Required permissions: -

###### Arguments

| Required |  Name  | Type |                          Description                          | Choices | Default |
| :------: | :----: | :--: | :-----------------------------------------------------------: | :-----: | :-----: |
|    ❌    | emotes | text | One or more emotes to download. Defaults to all server emotes |    -    |    -    |

#### emoji

_Get the url of one or more custom emotes_

Guild only: No

Required permissions: -

###### Arguments

| Required | Name  | Type |        Description        | Choices | Default |
| :------: | :---: | :--: | :-----------------------: | :-----: | :-----: |
|    ✅    | input | text | One or more custom emotes |    -    |    -    |

#### emojiinfo

_Get Info on an emoji/emote_

Guild only: No

Required permissions: -

###### Arguments

| Required | Name  | Type |       Description        | Choices | Default |
| :------: | :---: | :--: | :----------------------: | :-----: | :-----: |
|    ✅    | input | text | An emoji or custom emote |    -    |    -    |

---

## Misc

#### about

_Find out more about me_

Guild only: No

Required permissions: -

#### help

_Get help on command usage_

Guild only: No

Required permissions: -

###### Arguments

| Required | Name | Type |        Description         | Choices | Default |
| :------: | :--: | :--: | :------------------------: | :-----: | :-----: |
|    ❌    | name | text | command / command category |    -    |    -    |

#### ping

_Ping!_

Guild only: No

Required permissions: -

---

## Settings

#### prefixes

_Get a list of available prefixes_

Guild only: No

Required permissions: -

#### setprefix

_Change prefix_

Guild only: No

Required permissions: -

###### Arguments

| Required |  Name  | Type |                            Description                             |     Choices      | Default |
| :------: | :----: | :--: | :----------------------------------------------------------------: | :--------------: | :-----: |
|    ✅    | scope  | text | whether this prefix should be set on a server or only for yourself |   server, user   |    -    |
|    ✅    | action | text |                                 -                                  | add, remove, set |    -    |
|    ✅    | prefix | text |                           the new prefix                           |        -         |   >>    |

---

This markdown file was [auto generated](../scripts/gencmdmd.ts) based on [commit d4cc579
](https://github.com/Vendicated/EmoteBot/commit/d4cc57997d70d04e7f7a57de457cf512adac26e6)

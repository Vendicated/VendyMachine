# VendyMachine Command List

You can find a list of all commands below. For more info, simply click on the desired command!

- [Emotes](#Emotes)
	- [clone](#clone)
	- [create](#create)
	- [delete](#delete)
	- [download](#download)
	- [emoji](#emoji)
	- [emojiinfo](#emojiinfo)
	- [rename](#rename)
- [Images](#Images)
	- [convert](#convert)
	- [resize](#resize)
- [Misc](#Misc)
	- [about](#about)
	- [crawl](#crawl)
	- [help](#help)
	- [invite](#invite)
	- [ping](#ping)
- [Settings](#Settings)
	- [prefixes](#prefixes)
	- [setprefix](#setprefix)

___

## Emotes

### clone

*Clone one or more emojis/emotes to the current server*

- Guild only: Yes
- Required permissions: `Manage_emojis`

<details>
	<summary>Arguments</summary>

| Required |   Name  |               Type              | Description | Choices | Default |
| :------: | :-----: | :-----------------------------: | :---------: | :-----: | :-----: |
|     ✅    |  emojis | custom emotes or default emojis |      -      |    -    |    -    |
|     ✅    | boolean |                -                |      -      |    -    |         |

</details>

### create

*Create an emote*

- Guild only: Yes
- Required permissions: `Manage_emojis`

<details>
	<summary>Arguments</summary>

| Required | Name | Type | Description | Choices | Default |
| :------: | :--: | :--: | :---------: | :-----: | :-----: |
|     ✅    | name | text |  emoji name |    -    |    -    |
|     ❌    |  url |  url |  image url  |    -    |    -    |

</details>

### delete

*Delete one or more emotes*

- Guild only: Yes
- Required permissions: `Manage_emojis`

<details>
	<summary>Arguments</summary>

| Required |  Name  |      Type     | Description | Choices | Default |
| :------: | :----: | :-----------: | :---------: | :-----: | :-----: |
|     ✅    | emotes | server emotes |      -      |    -    |    -    |

</details>

### download

*Export emotes as zip. Supports default emojis or custom emotes*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name  |               Type              |                     Description                    | Choices | Default |
| :------: | :----: | :-----------------------------: | :------------------------------------------------: | :-----: | :-----: |
|     ❌    | emotes | custom emotes or default emojis | emotes to download (defaults to all server emotes) |    -    |    -    |

</details>

### emoji

*Get the url of one or more emojis/emotes*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name  |               Type              | Description | Choices | Default |
| :------: | :----: | :-----------------------------: | :---------: | :-----: | :-----: |
|     ✅    | emojis | custom emotes or default emojis |      -      |    -    |    -    |

</details>

### emojiinfo

*Get Info on an emoji/emote*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |              Name             | Type | Description | Choices | Default |
| :------: | :---------------------------: | :--: | :---------: | :-----: | :-----: |
|     ✅    | custom emote or default emoji |   -  |      -      |    -    |         |

</details>

### rename

*Rename an emote*

- Guild only: Yes
- Required permissions: `Manage_emojis`

<details>
	<summary>Arguments</summary>

| Required |     Name     | Type |  Description | Choices | Default |
| :------: | :----------: | :--: | :----------: | :-----: | :-----: |
|     ✅    | server emote |   -  |       -      |    -    |         |
|     ✅    |     name     | text | The new name |    -    |    -    |

</details>

___

## Images

### convert

*Convert images between formats. Supports svg, png, jpeg, webp and a bunch more, just try it out lol*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |     Name     |  Type  |  Description |     Choices     | Default |
| :------: | :----------: | :----: | :----------: | :-------------: | :-----: |
|     ❌    | outputFormat |  text  | image format | png, jpeg, webp |    -    |
|     ❌    |      url     |   url  |   image url  |        -        |    -    |
|     ❌    |     width    | number |  width in px |        -        |    -    |

</details>

### resize

*Downscale images until they are below a certain size*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required | Name | Type |            Description           | Choices | Default |
| :------: | :--: | :--: | :------------------------------: | :-----: | :-----: |
|     ✅    | size | text | size e.g. one of 100B/10.7KB/2MB |    -    |  256KB  |
|     ❌    |  url |  url |             image url            |    -    |    -    |

</details>

___

## Misc

### about

*Find out more about me*

- Guild only: No
- Required permissions: -

### crawl

*Follow a link's redirects to find out where it leads*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required | Name | Type | Description | Choices | Default |
| :------: | :--: | :--: | :---------: | :-----: | :-----: |
|     ✅    |  url |   -  |      -      |    -    |         |

</details>

### help

*Get help on command usage*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required | Name | Type |       Description       | Choices | Default |
| :------: | :--: | :--: | :---------------------: | :-----: | :-----: |
|     ❌    | name | text | command name / category |    -    |    -    |

</details>

### invite

*Invite me to your server*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required | Name | Type |        Description       | Choices | Default |
| :------: | :--: | :--: | :----------------------: | :-----: | :-----: |
|     ❌    |  id  | text | user id of bot to invite |    -    |    -    |

</details>

### ping

*Ping!*

- Guild only: No
- Required permissions: -

___

## Settings

### prefixes

*Get a list of available prefixes*

- Guild only: No
- Required permissions: -

### setprefix

*Change prefix*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name  | Type |  Description |      Choices     | Default |
| :------: | :----: | :--: | :----------: | :--------------: | :-----: |
|     ✅    |  scope | text | prefix scope |   server, user   |    -    |
|     ✅    | action | text |       -      | add, remove, set |    -    |
|     ✅    | prefix | text |  new prefix  |         -        |    -    |

</details>

___

This markdown file was [auto generated](../scripts/gencmdmd.ts) based on [commit ca97438](https://github.com/Vendicated/VendyMachine/commit/ca974387a54da89f2f906fd3fd2821c36a00e476)
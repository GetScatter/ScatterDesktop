import KEYS from '../keys';
const {
	GENERIC,
	LOGIN,
	DASHBOARD,
	ADD_KEYS,
	KEYPAIR,
	IDENTITY,
	CREATE_EOS,
	PERMISSIONS,
	SETTINGS,
	TRANSFER,
	USER_BAR,
	PROCESSES,
	SNACKBARS,
	POPOUTS,
	POPINS
} = KEYS;

// You can build your own pluralizers.
// This one for instance is for words that end with "s" when
// pluralized.
// See [DASHBOARD.APPS.NPermissions] for example usage
const plural_s = (n) => n === '{x}' ? '{plural_s}' : parseInt(n) === 1 ? '' : 's';

const Locale = {

	/****************************************************/
	/*                                                  */
	/*                     GENERIC                      */
	/*                                                  */
	/****************************************************/

	[GENERIC.Back]:() => `戻る`,
	[GENERIC.Confirm]:() => `確認`,
	[GENERIC.Allow]:() => `許可`,
	[GENERIC.Deny]:() => `無視`,
	[GENERIC.Okay]:() => `承諾`,
	[GENERIC.Cancel]:() => `中止`,
	[GENERIC.Open]:() => `開く`,
	[GENERIC.Yes]:() => `はい`,
	[GENERIC.No]:() => `いいえ`,
	[GENERIC.Enable]:() => `有効化`,
	[GENERIC.Disable]:() => `無効化`,
	[GENERIC.Select]:() => `選択`,
	[GENERIC.Unselect]:() => `選択解除`,
	[GENERIC.Edit]:() => `編集`,
	[GENERIC.Add]:() => `追加`,
	[GENERIC.Save]:() => `保存`,
	[GENERIC.New]:() => `新規`,
	[GENERIC.Delete]:() => `削除`,
	[GENERIC.Remove]:() => `削除`,
	[GENERIC.RemoveAll]:() => `すべて削除`,
	[GENERIC.Copy]:() => `コピー`,
	[GENERIC.Import]:() => `インポート`,
	[GENERIC.Export]:() => `エクスポート`,
	[GENERIC.Refresh]:() => `更新`,
	[GENERIC.Manage]:() => `管理`,
	[GENERIC.PrivateKey]:() => `プライベートキー`,
	[GENERIC.PublicKey]:(n = 1) => `パブリックキー${plural_s(n)}`,
	[GENERIC.Keys]:(n = 1) => `キー${plural_s(n)}`,
	[GENERIC.Hide]:() => `非表示`,
	[GENERIC.Reveal]:() => `表示`,
	[GENERIC.Tokens]:(n = 0) => `トークン${plural_s(n)}`,
	[GENERIC.Network]:(n = 1) => `ネットワーク${plural_s(n)}`,
	[GENERIC.Blockchain]:(n = 1) => `ブロックチェーン${plural_s(n)}`,
	[GENERIC.Contract]:(n = 1) => `コントラクト${plural_s(n)}`,
	[GENERIC.Memo]:() => `メモ`,
	[GENERIC.Symbol]:() => `略称`,
	[GENERIC.Decimals]:() => `小数点`,
	[GENERIC.PasswordOrPhrase]:() => `パスワードまたはバックアップフレーズ`,
	[GENERIC.Timestamp]:() => `時刻記録`,
	[GENERIC.ChainID]:() => `チェーン ID`,
	[GENERIC.Name]:() => `名前`,
	[GENERIC.Accounts]:(n = 0) => `アカウント${plural_s(n)}`,
	[GENERIC.AccountName]:() => `アカウント名`,
	[GENERIC.Address]:() => `アドレス`,
	[GENERIC.Search]:() => `検索`,
	[GENERIC.Buy]:() => `買い`,
	[GENERIC.Sell]:() => `売り`,
	[GENERIC.Buying]:() => `購入中`,
	[GENERIC.Selling]:() => `売却中`,

	

	/****************************************************/
	/*                                                  */
	/*                  LOGIN / AUTH                    */
	/*                                                  */
	/****************************************************/

	[LOGIN.NEW.Title]:() => `ようこそ!`,
	[LOGIN.NEW.SubTitle]:() =>
		`最初にすべてのデータを暗号化するために必要なパスワードを作成してください。簡単に推測できないようにしてください。`,
	[LOGIN.NEW.PasswordLabel]:() => `パスワードの選択`,
	[LOGIN.NEW.PasswordPlaceholder]:() => `簡単に推測できないパスワードにしてください!`,
	[LOGIN.NEW.PasswordConfirmLabel]:() => `パスワードを再入力してください`,
	[LOGIN.NEW.PasswordConfirmPlaceholder]:() => `再入力して再確認します`,
	[LOGIN.NEW.CreateButton]:() => `では開始しましょう!`,
	[LOGIN.NEW.RestoreBackupButton]:() => `バックアップからリストア`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[LOGIN.EXISTING.Title]:() => `お帰りなさい`,
	[LOGIN.EXISTING.PasswordPlaceholder]:() => `パスワードまたはバックアップフレーズ`,
	[LOGIN.EXISTING.ResetButton]:() => `パスワードの初期化`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[LOGIN.RESTORE.Title]:() => `バックアップからリストア`,
	[LOGIN.RESTORE.SubTitle]:() =>
		`すでに Scatter のバックアップを持っている場合には、ここで Scatter をインポートすることが可能です。 
        アンロックするにはパスワードを入力する必要があります。`,
	[LOGIN.RESTORE.ChooseButton]:() => `バックアップの選択`,
	[LOGIN.RESTORE.BackButton]:() => `最初から設定する`,




	/****************************************************/
	/*                                                  */
	/*                    DASHBOARD                     */
	/*                                                  */
	/****************************************************/

	[DASHBOARD.KEYS.SearchPlaceholder]:() => `キーの検索`,
	[DASHBOARD.KEYS.AddKeysButton]:() => `キーの追加`,
	[DASHBOARD.KEYS.NoKeys]:() => `休まず先に進みましょう!`,
	[DASHBOARD.KEYS.LinkedAccounts]:count => `${count} 個のリンクされたアカウント${plural_s(count)}`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[DASHBOARD.TOOLBARS.SendButton]:() => `送金`,
	[DASHBOARD.TOOLBARS.ReceiveButton]:() => `入金`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[DASHBOARD.APPS.SearchPlaceholder]:() => `アプリケーションの検索`,
	[DASHBOARD.APPS.NoAppsTitle]:() => `接続されたアプリはありません`,
	[DASHBOARD.APPS.NoAppsDescription]:() =>
		`上の検索欄に探したいアプリと関連する単語を入力してアプリを検索できます。`,
	[DASHBOARD.APPS.LinkPermissionOnly]:() => `リンク許可のみ`,
	[DASHBOARD.APPS.NPermissions]:n => `${n} 個のリンク許可${plural_s(n)}`,
	[DASHBOARD.APPS.NoPermissions]:() => `リンク許可していません`,
	[DASHBOARD.APPS.UnlinkedAppsTitle]:() => `下のアプリはリンクを許可していないアプリです`,
	[DASHBOARD.APPS.UnlinkedAppsSubtitle]:() => `表示されているアプリは Scatter チームによって追加したものではなく、
    　　アプリの開発チームが追加したものです。
		したがって Scatter チームがアプリを保証しているものでないことをご了解ください。`,
	[DASHBOARD.APPS.NoMeta]:() => `データなし`,



	/****************************************************/
	/*                                                  */
	/*                     ADD KEYS                     */
	/*                                                  */
	/****************************************************/

	[ADD_KEYS.SELECT.Disclaimer]:() => `プライベートキーはこのローカルコンピュータ内でのみ作成されインターネット内を通過しません。`,
	[ADD_KEYS.SELECT.CreateTitle]:() => `新規キーの作成`,
	[ADD_KEYS.SELECT.CreateDescription]:() =>
		`それぞれのブロックチェーンで使用可能な新規のキーを作成します。
		新規のキーには未使用でトークンの残高はありません。`,
	[ADD_KEYS.SELECT.CreateButton]:() => `キーを作成`,
	[ADD_KEYS.SELECT.ImportTitle]:() => `既存のキーをインポート`,
	[ADD_KEYS.SELECT.ImportDescription]:() => `既にキーを持っている場合、 Scatter にインポートすることが可能です。`,
	[ADD_KEYS.SELECT.ImportButton]:() => `キーのインポート`,
	[ADD_KEYS.SELECT.CreateEosTitle]:() => `新規 EOS アカウントの作成`,
	[ADD_KEYS.SELECT.CreateEosDescription]:() => `2つのキーを即時作成します。`,
	[ADD_KEYS.SELECT.CreateEosButton]:() => `EOS アカウント`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.IMPORT.NameLabel]:() => `キーの名前`,
	[ADD_KEYS.IMPORT.NamePlaceholder]:() => `このキーに名前を付けてください。`,
	[ADD_KEYS.IMPORT.TextTitle]:() => `プライベートキーをテキスト形式でインポート`,
	[ADD_KEYS.IMPORT.TextDescription]:() => `プライベートキーを張り付けるか入力します`,
	[ADD_KEYS.IMPORT.TextButton]:() => `テキスト`,
	[ADD_KEYS.IMPORT.HardwareTitle]:() => `ハードウェアウォレットからインポート`,
	[ADD_KEYS.IMPORT.HardwareDescription]:() => `対応するハードウェアウォレットを使用します`,
	[ADD_KEYS.IMPORT.HardwareButton]:() => `ハードウェア`,
	[ADD_KEYS.IMPORT.QrTitle]:() => `QR コードからプライベートキーをインポート`,
	[ADD_KEYS.IMPORT.QrDescription]:() => `暗号化されたペーパーウォレットの QR コードを読み取ります`,
	[ADD_KEYS.IMPORT.QrButton]:() => `QR`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.IMPORT_TEXT.KeyLabel]:() => `プライベートキーを入力`,
	[ADD_KEYS.IMPORT_TEXT.KeyPlaceholder]:() => `プライベートキーを正確に入力してください`,
	[ADD_KEYS.IMPORT_TEXT.ERRORS.InvalidKeyLength]:x => `プライベートキーの文字数が足りません (${x})`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.IMPORT_HW.SelectHardwareLabel]:() => `ハードウェアウォレットの選択`,
	[ADD_KEYS.IMPORT_HW.AvailableBlockchainsLabel]:() => `設定対象のブロックチェーン`,
	[ADD_KEYS.IMPORT_HW.IndexLabel]:() => `キー/アドレスインデックス`,
	[ADD_KEYS.IMPORT_HW.HardwareError]:() => `ハードウェアエラー`,
	[ADD_KEYS.IMPORT_HW.UnlockLedgerError]:x => `Ledger のロックを解除して ${x} Ledger アプリを起動してください。`,
	[ADD_KEYS.IMPORT_HW.UnlockedLiquidEOSError]:() => `Liquid EOS ハードウェアウォレットのロックを解除してください。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[ADD_KEYS.EOS_KEYS.OwnerDescription]:() =>
		`これはアカウントを完全にコントロールできるマスターキーです。 
		絶対に必要な場合を除き Scatter 内には保存しないでください。`,
	[ADD_KEYS.EOS_KEYS.ActiveDescription]:() =>
		`これはアプリ利用に使用するキーです。通常 Scatter 内に保存してください。`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountTitle]:() => `これらのキーを EOS アカウント作成に使用します。`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountDescription]:() =>
		`キーのみでは EOS を使用することはできません。キーを使用して EOS アカウントを作成する必要があります。`,
	[ADD_KEYS.EOS_KEYS.CreateEosAccountButton]:() => `アカウントの作成`,


	/****************************************************/
	/*                                                  */
	/*               CREATE EOS ACCOUNT                 */
	/*                                                  */
	/****************************************************/
	[CREATE_EOS.DisclaimerTitle]:() => `EOS ブロックチェーン上のアカウントの作成は有料です。`,
	[CREATE_EOS.AccountNameLengthError]:() => `アカウント名は 12 文字の長さにしてください。`,
	[CREATE_EOS.AccountNameFormattingError]:() => `アカウント名はすべて英小文字にしてください。`,
	[CREATE_EOS.SelectCreatorError]:() => `最初にアカウントクリエイターを選択してください。`,
	[CREATE_EOS.CheckingNameAlert]:() => `名前が使用可能か調べています...`,
	[CREATE_EOS.NameTakenAlert]:() => `名前は既に使用されています。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[CREATE_EOS.ACCOUNT.AccountsLabel]:() => `このアカウントがアカウントを作成するために使用されます`,
	[CREATE_EOS.ACCOUNT.RamCostLabel]:() => `必要 RAM Cost`,
	[CREATE_EOS.ACCOUNT.ResourcesLabel]:() => `CPU および NET`,
	[CREATE_EOS.ACCOUNT.ResourcesLowError]:(amount) => `最低 ${amount} を割り当ててください`,
	[CREATE_EOS.ACCOUNT.TotalLabel]:() => `合計`,
	[CREATE_EOS.ACCOUNT.ActionBarButton]:() => `アカウントの作成`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[CREATE_EOS.EXCHANGE.ChangeName]:() => `名前を変更しますか?`,
	[CREATE_EOS.EXCHANGE.InfoTitle]:() => `EOS ブロックチェーン上のアカウントを作成するためにはリソースを購入する必要があります。`,
	[CREATE_EOS.EXCHANGE.InfoSubtitle]:() => `アカウント作成費用から超過した料金はアカウントへ振り込まれます。`,
	[CREATE_EOS.EXCHANGE.UseNameButton]:() => `この名前を使用`,
	[CREATE_EOS.EXCHANGE.ExchangeFieldParts]:() => [
		`最低必要額の`,    // 2 EOS
		`送金先として`,       // makeaccounts
		`送金元として`,             // EOS5kd....
		`をメモに記述`,
	],
	[CREATE_EOS.EXCHANGE.SentTitle]:() => `取引所から EOS を上記内容で送金後、トランザクション ID をここにコピーしてください。`,
	[CREATE_EOS.EXCHANGE.SentSubtitle]:() => `トランザクションが改変不能な状態になるまで 3 分程度かかります。`,
	[CREATE_EOS.EXCHANGE.TransactionIDLabel]:() => `トランザクション ID`,
	[CREATE_EOS.EXCHANGE.ActionBarButton]:() => `アカウントの作成`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[CREATE_EOS.ERRORS.InvalidResources]:() => `CPU または NET のいずれかが 0 以下です`,



	/****************************************************/
	/*                                                  */
	/*                 WALLET / KEYPAIR                 */
	/*                                                  */
	/****************************************************/
	[KEYPAIR.NameLabel]:() => Locale[ADD_KEYS.IMPORT.NameLabel](),
	[KEYPAIR.NamePlaceholder]:() => Locale[ADD_KEYS.IMPORT.NamePlaceholder](),
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.DASHBOARD.STATES.AddAccount]:() => `アカウントの追加`,
	[KEYPAIR.DASHBOARD.STATES.LinkedAccounts]:() => `リンク済アカウント`,
	[KEYPAIR.DASHBOARD.STATES.KeysAndBlockchains]:() => `キーおよびブロックチェーン`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountLabel]:() => `新規 EOS アカウントの作成`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountDescription]:() =>
		`このキーに新規 EOS アカウントを作成します。`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.CreateEosAccountButton]:() => `アカウントの作成`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.LinkEosAccountLabel]:() => `既存の EOS アカウントにリンク`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.LinkEosAccountDescription]:() =>
		`既存の EOS アカウントが、インポートされていない場合に使用します。`,
	[KEYPAIR.DASHBOARD.ADD_ACCOUNT.AccountNetworkLabel]:() => `既存の EOS アカウントにリンク`,
	[KEYPAIR.DASHBOARD.ERRORS.InvalidWalletName]:() => `このキーに名前を入力`,
	[KEYPAIR.DASHBOARD.ERRORS.WalletNameExists]:() => `この名前のキーが既に存在します`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.TOKENS.HiddenTokensCount]:(n) => `${n} 個のトークンがトークンスパムフィルターによって除外されています。`,
	[KEYPAIR.TOKENS.SearchPlaceholder]:() => `トークンの検索`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.ACCOUNTS.SearchPlaceholder]:() => `アカウントの検索`,
	[KEYPAIR.ACCOUNTS.ViewTokens]:n => `${n} 個のトークン${plural_s(n)}`,
	[KEYPAIR.ACCOUNTS.EOSClaimRefundButton]:() => `払い戻し`,
	[KEYPAIR.ACCOUNTS.EOSDangerousPermissions]:() =>
		`アクティブキーとオーナーキーが同一です。`,
	[KEYPAIR.ACCOUNTS.EOSDangerousPermissionsSubtitle]:() =>
		`セキュリティ向上のために下の "権限の変更" ボタンを押してどちらかを変更することを推奨します。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.ACCOUNTS.ACTIONS.EOS.ChangePermissionsButton]:() => `権限の変更`,
	[KEYPAIR.ACCOUNTS.ACTIONS.EOS.ProxyVotesButton]:() => `委任投票`,
	[KEYPAIR.ACCOUNTS.ACTIONS.EOS.UnlinkAccountButton]:() => `リンクの解除`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.BLOCKCHAINS.CopyButton]:() => `パブリックキーのコピー`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.SELECT.KeyTitle]:() => `キー`,
	[KEYPAIR.EXPORT.SELECT.KeyDescription]:() => `プライベートキーをテキスト形式でエキスポート`,
	[KEYPAIR.EXPORT.SELECT.QrTitle]:() => `ペーパーウォレット`,
	[KEYPAIR.EXPORT.SELECT.QrDescription]:() => `プライベートキーを暗号化された QR コードでエキスポート`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.KEY.Title]:() => `テキスト形式のプライベートキー`,
	[KEYPAIR.EXPORT.KEY.CopyButton]:() => `コピー`,
	[KEYPAIR.EXPORT.KEY.RevealButton]:() => `表示`,
	[KEYPAIR.EXPORT.KEY.HideButton]:() => `非表示`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[KEYPAIR.EXPORT.QR.Title]:() => `ペーパーウォレットの QR コード`,
	[KEYPAIR.EXPORT.QR.SaveButton]:() => `画像を保存`,




	/****************************************************/
	/*                                                  */
	/*                    IDENTITIES                    */
	/*                                                  */
	/****************************************************/
	[IDENTITY.Title]:() => `アイデンティティ`,
	[IDENTITY.DisclaimerTitleImportant]:() => `通常 Scatter を使用するにはここに何も設定する必要はありませんが、`,
	[IDENTITY.DisclaimerTitle]:() =>
		`ショッピングアプリなどの特定のアプリでは注文をする際に住所を必要とするなど 
		 Scatter と接続するために必要になる場合があります。`,
	[IDENTITY.DisclaimerSubtitle]:() => `すべての入力情報はこのローカルコンピュータ内でのみ作成されユーザーの同意なしで送信されることはありません。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[IDENTITY.NameLabel]:() => `アイデンティティ名 / ユーザー名`,
	[IDENTITY.NamePlaceholder]:() => `オンライン上の識別名`,
	[IDENTITY.NameError]:() => `アイデンティティ名は空白、スペースの使用や特殊文字の使用はできません。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[IDENTITY.PERSONAL.NameLabel]:() => `氏名`,
	[IDENTITY.PERSONAL.NamePlaceholder]:() => `フルネームを入力`,
	[IDENTITY.PERSONAL.DateOfBirthLabel]:() => `誕生日`,
	[IDENTITY.PERSONAL.EmailLabel]:() => `Email`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[IDENTITY.LOCATION.DisclaimerTitle]:() => `複数の場所を作成できます。`,
	[IDENTITY.LOCATION.DisclaimerSubtitle]:() => `例えば "Home" や "Work" などです。必要に応じて場所を切り替えて使用します。`,
	[IDENTITY.LOCATION.SelectorLabel]:() => `場所`,
	[IDENTITY.LOCATION.SelectorAddButton]:() => `追加`,
	[IDENTITY.LOCATION.NameLabel]:() => `場所の名前`,
	[IDENTITY.LOCATION.NamePlaceholder]:() => `Home`,
	[IDENTITY.LOCATION.NameError]:() => `場所は空白ではなりません。`,
	[IDENTITY.LOCATION.CountryLabel]:() => `国`,
	[IDENTITY.LOCATION.CountryItemNone]:() => `未選択`,
	[IDENTITY.LOCATION.PhoneLabel]:() => `電話番号`,
	[IDENTITY.LOCATION.PhonePlaceholderArea]:() => `090`,
	[IDENTITY.LOCATION.PhonePlaceholderPrefix]:() => `5555`,
	[IDENTITY.LOCATION.PhonePlaceholderSuffix]:() => `5555`,
	[IDENTITY.LOCATION.AddressLabel]:() => `住所`,
	[IDENTITY.LOCATION.AddressPlaceholder]:() => `1 Marunouchi, Chiyodaku`,
	[IDENTITY.LOCATION.CityLabel]:() => `都道府県`,
	[IDENTITY.LOCATION.CityPlaceholder]:() => `Tokyo`,
	[IDENTITY.LOCATION.StateLabel]:() => `州`,
	[IDENTITY.LOCATION.StatePlaceholder]:() => `NY`,




	/****************************************************/
	/*                                                  */
	/*                   PERMISSIONS                    */
	/*                                                  */
	/****************************************************/
	[PERMISSIONS.ListLabel]:() => `権限`,
	[PERMISSIONS.LoginPermission]:() => `ログイン権限`,
	[PERMISSIONS.AccountsLabel]:() => `使用アカウント`,
	[PERMISSIONS.RequiredFieldsLabel]:() => `必要フィールド`,
	[PERMISSIONS.MutableFieldsLabel]:() => `対象フィールド`,
	[PERMISSIONS.RemoveLabel]:() => `権限の削除`,
	[PERMISSIONS.RemoveIdentityText]:() =>
		`ログイン権限はアプリが Scatter への通信権限を与えるものです。
        この権限を削除するとアプリから強制的にログアウトします。`,
	[PERMISSIONS.RemoveWhitelistLabel]:() =>
		`アクションホワイトリストはトランザクションに署名する際にポップアップ内の承認作業を省略することが可能になります。
        このホワイトリストを削除しますか?`,
	[PERMISSIONS.ActionWhitelist]:() => `アクションホワイトリスト`,




	/****************************************************/
	/*                                                  */
	/*                     SETTINGS                     */
	/*                                                  */
	/****************************************************/
	[SETTINGS.Basics]:() => `基本設定`,
	[SETTINGS.DangerZone]:() => `危険ゾーン`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.MENU.General]:() => `一般`,
	[SETTINGS.MENU.Language]:() => `言語`,
	[SETTINGS.MENU.Tokens]:() => `トークン`,
	[SETTINGS.MENU.Explorers]:() => `エクスプローラー`,
	[SETTINGS.MENU.PIN]:() => `PIN`,
	[SETTINGS.MENU.Firewall]:() => `ファイアウォール`,
	[SETTINGS.MENU.Networks]:() => `ネットワーク`,
	[SETTINGS.MENU.Password]:() => `パスワード`,
	[SETTINGS.MENU.Backup]:() => `バックアップ`,
	[SETTINGS.MENU.Destroy]:() => `廃棄`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.GENERAL.VersionLabel]:() => `バージョン`,
	[SETTINGS.GENERAL.UpdateAvailable]:() => `アップデート可能`,
	[SETTINGS.GENERAL.NoUpdateAvailable]:() => `最新のバージョン`,
	[SETTINGS.GENERAL.WhitelistNotificationsLabel]:() => `ホワイトリスト通知`,
	[SETTINGS.GENERAL.WhitelistNotificationsDescription]:() =>
		`対応するオペレーティングシステムではホワイトリストされた自動署名トランザクションを通知します。`,
	[SETTINGS.GENERAL.DataPathLabel]:() => `データの保存場所`,
	[SETTINGS.GENERAL.DataPathDescription]:() =>
		`Scatter が暗号化されたデータを保存するローカルコンピュータ内の場所です。`,
	[SETTINGS.GENERAL.DeveloperConsoleLabel]:() => `開発者向けコンソール`,
	[SETTINGS.GENERAL.DeveloperConsoleDescription]:() =>
		`Scatter のエラーログなどを参照する場合に使用します。`,
	[SETTINGS.GENERAL.DeveloperConsoleButton]:() => `コンソールを開く`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.LANGUAGE.Label]:() => `Select your Language`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.TOKENS.SWITCH.ADD_TOKEN]:() => `トークンの追加`,
	[SETTINGS.TOKENS.SWITCH.WHITELIST]:() => `トークン`,
	[SETTINGS.TOKENS.SWITCH.BLACKLIST]:() => `フィルタ済`,
	[SETTINGS.TOKENS.SWITCH.SETTINGS]:() => `設定`,
	[SETTINGS.TOKENS.ADD_TOKEN.Disclaimer]:() => `トークンを追加することで送金や残高を参照することが可能です。`,
	[SETTINGS.TOKENS.ADD_TOKEN.TokenNamePlaceholder]:() => `名前を入力するか空白にして略称を使用`,
	[SETTINGS.TOKENS.ADD_TOKEN.TokenNameLabel]:() => `トークン名`,
	[SETTINGS.TOKENS.ADD_TOKEN.WhitelistTokenButton]:() => `ホワイトリストトークン`,
	[SETTINGS.TOKENS.ADD_TOKEN.BlacklistTokenButton]:() => `ブラックリストトークン`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayLabel]:() => `主残高表示`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayDescription]:() =>
		`メインのダッシュボード内にすべてのネットワークのトークン残高を表示するかメインネットのみのトークン残高を表示するかを設定できます。`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayMainnetButton]:() => `すべてのネットワークを表示`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayMainnetDesc]:() =>
		`メインネットのみのトークン残高の表示では他のチェーンやテストネットのトークン残高を合計額の計算に使用しません。`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayAllNetworksButton]:() => `メインネットのみ表示`,
	[SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayAllNetworksDesc]:() =>
		`すべてのネットワークのトークン残高の表示ではすべてのネットワークのトークン残高を合計額の計算に使用します。`,
	[SETTINGS.TOKENS.SETTINGS.FilterSmallBalancesLabel]:() => `少額の残高を除外`,
	[SETTINGS.TOKENS.SETTINGS.FilterSmallBalancesDescription]:() =>
		`少額のトークンの残高を除外するには以下の入力欄に除外したい額を入力してください。`,
	[SETTINGS.TOKENS.WHITE_BLACK.TokenFilterLabel]:() => `ブロックチェーン毎の除外トークン`,
	[SETTINGS.TOKENS.WHITE_BLACK.TokenSearchPlaceholder]:() => `トークンの検索`,
	[SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.Disclaimer]:() =>
		`主として表示させるトークンまたは通貨を選択してください。`,
	[SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.FiatCurrencyLabel]:() => `法定通貨として表示`,
	[SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.SystemTokensLabel]:() => `システムトークン`,
	[SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.CustomTokensLabel]:() => `カスタムトークン`,
	[SETTINGS.TOKENS.WHITE_BLACK.BLACKLIST.Disclaimer]:() => `除外済のトークンは表示されません。`,
	[SETTINGS.TOKENS.WHITE_BLACK.BLACKLIST.DisclaimerSubtitle]:() =>
		`このネットワークのシステムトークンは除外することはできません。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.PIN.Label]:() => `PIN の変更`,
	[SETTINGS.PIN.Description]:() => `PIN は送金を実行する際の内部パスワードとして使用します。`,
	[SETTINGS.PIN.DescriptionRed]:() => `PIN をパスワードと同一にしないでください!`,
	[SETTINGS.PIN.Placeholder]:() => `PIN 無効`,
	[SETTINGS.PIN.SavedSnackbar]:() => `PIN 保存済`,
	[SETTINGS.PIN.PinForAllTitle]:() => `PIN をすべての処理で使用します。`,
	[SETTINGS.PIN.PinForAllDescription]:() => `有効にした場合、すべて処理のポップアップで PIN の入力を求められます。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.NETWORKS.SWITCH.Known]:() => `既知のネットワーク`,
	[SETTINGS.NETWORKS.SWITCH.Custom]:() => `現在のネットワーク`,
	[SETTINGS.NETWORKS.KNOWN.AddLabel]:() => `既知のネットワークを追加`,
	[SETTINGS.NETWORKS.KNOWN.AddDescription]:() =>
		`使用頻度が高いネットワークは詳細を入力することなく追加することが可能です。`,
	[SETTINGS.NETWORKS.CUSTOM.NamePlaceholder]:() => `ローカルネットワーク`,
	[SETTINGS.NETWORKS.CUSTOM.HostLabel]:() => `ホスト名 ( domain.com 又は IP )`,
	[SETTINGS.NETWORKS.CUSTOM.ProtocolLabel]:() => `プロトコル`,
	[SETTINGS.NETWORKS.CUSTOM.PortLabel]:() => `ポート`,
	[SETTINGS.NETWORKS.CUSTOM.ChainIdTooltip]:() => `チェーン ID`,
	[SETTINGS.NETWORKS.CUSTOM.FromOriginPlaceholder]:() => `オリジナル`,
	[SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenLabel]:() => `カスタムシステムトークン`,
	[SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenDescription]:() => `システムトークンの変更が必要となる場合があります。`,
	[SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenUseDefaultButton]:() => `既定のシステムトークンを使用`,
	[SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenUseCustomButton]:() => `カスタムシステムトークンを使用`,
	[SETTINGS.NETWORKS.CUSTOM.UsingCustomSystemToken]:() => `このネットワークはカスタムトークンを使用しています。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.PASSWORD.ChangePasswordLabel]:() => `パスワードの変更`,
	[SETTINGS.PASSWORD.ChangePasswordDescription]:() =>
		`パスワードを変更する際には Scatter をアンロックするために必要な第2のパスワードとして
		新しいニモニック(シードフレーズ)が生成されます。`,
	[SETTINGS.PASSWORD.NewPasswordLabel]:() => `新規パスワード`,
	[SETTINGS.PASSWORD.NewPasswordPlaceholder]:() => `パスワード`,
	[SETTINGS.PASSWORD.ConfirmPasswordLabel]:() => `新規パスワードの確認`,
	[SETTINGS.PASSWORD.ConfirmPasswordPlaceholder]:() => `パスワードの再入力`,
	[SETTINGS.PASSWORD.ChangePasswordButton]:() => `パスワードの変更`,
	[SETTINGS.PASSWORD.ViewMnemonicLabel]:() => `ニモニックの表示`,
	[SETTINGS.PASSWORD.ViewMnemonicDescription]:() =>
		`パスワードのニモニックを紛失した場合に表示します。`,
	[SETTINGS.PASSWORD.ViewMnemonicButton]:() => `ニモニックの表示`,
	[SETTINGS.PASSWORD.ChangedPasswordSnackbar]:() => `パスワード変更済`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.BACKUP.Label]:() => `バックアップの設定`,
	[SETTINGS.BACKUP.Description]:() =>
		`バックアップは Scatter 内のすべてのキー、
        権限および設定を保存します。`,
	[SETTINGS.BACKUP.AutoBackupLocationLabel]:() => `自動バックアップの場所`,
	[SETTINGS.BACKUP.CreateBackupButton]:() => `バックアップの作成`,
	[SETTINGS.BACKUP.CurrentBackupFolderLabel]:() => `現在のバックアップフォルダ`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.FIREWALL.ENABLED.Label]:() => `ファイアウォールを有効化`,
	[SETTINGS.FIREWALL.ENABLED.Description]:() =>
		`RIDL Defender は Scatter の非中央集権型ファイアウォールです。悪意のあるウェブサイト、アプリケーションやアカウントから保護します。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SETTINGS.DESTROY.Label]:() => `設定`,
	[SETTINGS.DESTROY.Description]:() =>
		`Scatter の廃棄はローカルコンピュータ内に保存されている Scatter のキーや
        アイデンティティを含むすべてのデータを消去します。
        ブロックチェーン内のアカウントやトークンは削除しません。`,
	[SETTINGS.DESTROY.Important]:() => `実行前にバックアップを別の場所に保存してあるか確認してください!`,
	[SETTINGS.DESTROY.Button]:() => `Scatter の廃棄`,




	/****************************************************/
	/*                                                  */
	/*                     TRANSFER                     */
	/*                                                  */
	/****************************************************/
	[TRANSFER.SendButton]:() => `送金`,
	[TRANSFER.FROM.FromLabel]:() => `送金元`,
	[TRANSFER.FROM.SendingAccountsLabel]:() => `アカウント名`,
	[TRANSFER.TOKENS.AmountLabel]:() => `送金額`,
	[TRANSFER.TOKENS.CustomTokenLabel]:() => `カスタムトークン`,
	[TRANSFER.TOKENS.SaveTokenButton]:() => `トークンの保存`,
	[TRANSFER.RECIPIENT.RecipientLabel]:() => `送金先`,
	[TRANSFER.RECIPIENT.SendToContact]:() => `連絡先`,
	[TRANSFER.RECIPIENT.SendDirectly]:() => `直接`,
	[TRANSFER.RECIPIENT.SendSelf]:() => `自身`,
	[TRANSFER.RECIPIENT.SearchContactsPlaceholder]:() => `連絡先の検索`,
	[TRANSFER.RECIPIENT.SearchSelfPlaceholder]:() => `アカウントの検索`,
	[TRANSFER.RECIPIENT.ContactsLabel]:() => `連絡先`,
	[TRANSFER.RECIPIENT.VerifyRecipient]:() => `再度確認してください`,
	[TRANSFER.RECIPIENT.ContactNamePlaceholder]:() => `連絡先名`,
	[TRANSFER.RECIPIENT.ContactNameLabel]:(x) => `${x} を連絡先として追加しますか?`,
	[TRANSFER.ERRORS.InvalidRecipient]:() => `無効な送金先`,
	[TRANSFER.ERRORS.InvalidAmount]:() => `無効な金額です。0 以上必要です`,


	/****************************************************/
	/*                                                  */
	/*                     USER BAR                     */
	/*                                                  */
	/****************************************************/
	[USER_BAR.ManageIdentity]:() => `アイデンティティの管理`,


	/****************************************************/
	/*                                                  */
	/*                    PROCESSES                     */
	/*                                                  */
	/****************************************************/
	[PROCESSES.FetchAccountsFromNetwork]:x => `${x} に関するアカウントを呼び出し中`,
	[PROCESSES.ImportingAccountsFromNetwork]:x => `${x[1]} に関する ${x[0]} アカウントをインポート中`,
	[PROCESSES.ImportingAccounts]:() => `アカウントのインポート中`,
	[PROCESSES.LoadingResources]:() => `アカウントリソースのロード中`,
	[PROCESSES.AccountsLeft]:(x) => `残りアカウント: ${x}`,


	/****************************************************/
	/*                                                  */
	/*                    SNACKBARS                     */
	/*                                                  */
	/****************************************************/
	[SNACKBARS.CopiedToClipboard]:() => `クリップボードへコピー済`,
	[SNACKBARS.BadPassword]:() => `無効なパスワード`,
	[SNACKBARS.SavedImage]:() => `画像保存済`,
	[SNACKBARS.TokenAdded]:() => `トークン追加済`,
	[SNACKBARS.ContactExists]:() => `他の連絡先がこの送金先に存在しています`,
	[SNACKBARS.ContactNameExists]:() => `他の連絡先はこの名前に存在しています`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SNACKBARS.NETWORK.MissingName]:() => `ネットワークは名前が必要`,
	[SNACKBARS.NETWORK.MissingHost]:() => `ネットワークはホスト名が必要`,
	[SNACKBARS.NETWORK.MissingPort]:() => `ネットワークは有効なポートが必要`,
	[SNACKBARS.NETWORK.MissingChain]:() => `ネットワークはチェーン ID が必要`,
	[SNACKBARS.NETWORK.ChainExists]:() => `このチェーン ID のネットワークは既に存在しています`,
	[SNACKBARS.NETWORK.NameExists]:() => `この名前のネットワークは既に存在しています`,
	[SNACKBARS.NETWORK.Saved]:() => `ネットワーク設定保存済!`,
	[SNACKBARS.NETWORK.Deleted]:() => `ネットワーク削除済!`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SNACKBARS.TOKENS.MissingSymbol]:() => `トークンの略称を追加してください`,
	[SNACKBARS.TOKENS.MissingContract]:() => `トークンのコントラクトを追加してください`,
	[SNACKBARS.TOKENS.TokenExistsAdded]:() => `このトークンは既に追加されています`,
	[SNACKBARS.TOKENS.TokenExistsFiltered]:() => `トークンは除外済トークンに存在します`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[SNACKBARS.AUTH.LockedOut]:() => `一時的にロックアウトされています`,
	[SNACKBARS.AUTH.ErrorParsingBackup]:() => `バックアップファイルの解析エラー`,
	[SNACKBARS.AUTH.ErrorDecryptingBackup]:() => `バックアップファイルの復号エラー`,
	[SNACKBARS.AUTH.CantReadBackup]:() => `バックアップファイルを読み取れません`,
	[SNACKBARS.AUTH.PasswordLength]:() => `パスワードは 8 文字以上の長さが必要です`,
	[SNACKBARS.AUTH.InvalidConfirmation]:() => `パスワードが一致しません`,


	/****************************************************/
	/*                                                  */
	/*                     POPOUTS                      */
	/*                                                  */
	/****************************************************/
	[POPOUTS.REQ_FIELDS.PersonalInfo]:() => `個人情報`,
	[POPOUTS.REQ_FIELDS.LocationInfo]:() => `場所情報`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.LOGIN.AccountRequirements]:() => `アプリが必要とするこれらネットワークのアカウント`,
	[POPOUTS.LOGIN.NoAccountsTitle]:() => `このアプリケーションは必要とするネットワークのブロックチェーンアカウントを持っていません。`,
	[POPOUTS.LOGIN.NoAccountsDesc]:() =>
		`このアプリケーションにログインする前に Scatter 上でこのアプリケーションが必要とするネットワーク/ブロックチェーンのキーをインポートしてください。`,
	[POPOUTS.LOGIN.MissingFieldsTitle]:() => `いくつかの入力欄が未入力です!`,
	[POPOUTS.LOGIN.MissingFieldsDesc]:() =>
		`後に使用するアイデンティティを下の入力欄へ入力して追加したのち、アプリケーションへ戻ってください。`,
	[POPOUTS.LOGIN.LoginButton]:() => `ログイン`,
	[POPOUTS.LOGIN.ShowAllAccounts]:() => `全て表示`,
	[POPOUTS.LOGIN.FilterAccounts]:() => `除外`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.GET_KEY.GenerateKeyButton]:() => `新規キーの生成`,
	[POPOUTS.GET_KEY.SearchPlaceholder]:() => `キーの検索`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.LINK_APP.AppKey]:() => `アプリキー`,
	[POPOUTS.LINK_APP.Disclaimer]:() => `アプリケーション名は通信するアプリケーションであることを確認してください。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.SIGNATURE.ActionsTotal]:x => `${x} アクション合計`,
	[POPOUTS.SIGNATURE.AccountsInvolved]:() => `関連済アカウント`,
	[POPOUTS.SIGNATURE.KeysInvolved]:() => `関連済キー`,
	[POPOUTS.SIGNATURE.ArbitraryDisabledTitle]:() => `任意署名を無効!`,
	[POPOUTS.SIGNATURE.ArbitraryDisabledDesc]:() =>
		`安全のために 12 文字以上の任意署名を無効にしています。`,
	[POPOUTS.SIGNATURE.WhitelistDesc]:() => `これのホワイトリストは次回拒否します`,
	[POPOUTS.SIGNATURE.DisableWhitelistButton]:() => `ホワイトリストを無効`,
	[POPOUTS.SIGNATURE.EnableWhitelistButton]:() => `ホワイトリストを有効`,
	[POPOUTS.SIGNATURE.PreviouslyWhitelisted]:() => `このアクションは以前ホワイトリスト化されています。`,
	[POPOUTS.SIGNATURE.HiddenActions]:() => `アクションは非表示`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPOUTS.TRANSFER.SendingTo]:symbol => `${symbol} の送金先`,
	[POPOUTS.TRANSFER.SearchPlaceholder]:() => `アカウントの検索`,



	/****************************************************/
	/*                                                  */
	/*                     POPINS                       */
	/*                                                  */
	/****************************************************/
	[POPINS.FULLSCREEN.CHECK_HARDWARE.Title]:() => `ハードウェアの確認`,
	[POPINS.FULLSCREEN.CHECK_HARDWARE.Desc]:() => `ハードウェアウォレット内で確認してください。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.CONFIRM_PASS.Title]:() => `パスワードの確認`,
	[POPINS.FULLSCREEN.CONFIRM_PASS.Label]:() => `パスワードまたはバックアップフレーズを入力`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.DESTROY.Title]:() => `Scatter の廃棄`,
	[POPINS.FULLSCREEN.DESTROY.Disclaimer]:() =>
		`実行する前にすべてのキーがバックアップされているか確認してください。`,
	[POPINS.FULLSCREEN.DESTROY.Desc]:() =>
		`Scatter の廃棄は復元することができません。リストアによる復元にはバックアップが必要です。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.WHITELISTING.Title]:() => `ホワイトリストを有効`,
	[POPINS.FULLSCREEN.WHITELISTING.Desc]:() =>
		`アクションのホワイトリスト設定は信頼できるアプリケーションで都度アクションの承認をする必要がありません。
		ホワイトリスト設定時は承認するアクションと値がチェックボックスで表示されます。`,
	[POPINS.FULLSCREEN.WHITELISTING.ActionLabel]:() => `このアクションはホワイトリスト設定されます`,
	[POPINS.FULLSCREEN.WHITELISTING.MutableProp]:() => `この値はポップアップなしで変更可能です`,
	[POPINS.FULLSCREEN.WHITELISTING.ImmutableProp]:() => `これを変更した場合にはアクションを再度承認する必要があります`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.Available]:x => `使用可能 ${x}`,
	[POPINS.FULLSCREEN.EOS.Reclaiming]:x => `返還中 ${x}`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Title]:() => `アカウント権限の変更`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Desc]:() => `アカウント権限を変更することはアカウントの権限を保持するキーを変更することです。`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.SubDesc]:() => `既存のキーの権限を保持する場合には空白のままにします。`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.KeysLabel]:() => `インポートされたキー`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.KeyPlaceholder]:() => `パブリックキーまたはアカウント名を入力`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.OwnerLabel]:() => `オーナー`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.ActiveLabel]:() => `アクティブ`,
	[POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Button]:() => `権限の変更`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.MOD_CPUNET.Stake]:() => `ステーク`,
	[POPINS.FULLSCREEN.EOS.MOD_CPUNET.Unstake]:() => `アンステーク`,
	[POPINS.FULLSCREEN.EOS.MOD_CPUNET.StakeDesc]:() =>
		`CPU および NET を自身のアカウント内で追加ステークすることでブロックチェーン上で実行できる処理が増加します。`,
	[POPINS.FULLSCREEN.EOS.MOD_CPUNET.UnstakeDesc]:() =>
		`CPU および NET をアンステークすることでトークンは返還されますが実行できる処理が減少します。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.MOD_RAM.BuyDesc]:() => `RAM を追加購入することでブロックチェーン上で保有できるデータが増加します。`,
	[POPINS.FULLSCREEN.EOS.MOD_RAM.SellDesc]:() => `RAM を売却することでトークンは売却時の時価で返還されます。`,
	[POPINS.FULLSCREEN.EOS.MOD_RAM.BytesError]:() => `15 バイト以上である必要があります`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.EOS.PROXY.Title]:() => `委任投票`,
	[POPINS.FULLSCREEN.EOS.PROXY.ReproxyTitle]:() => `委任投票を 7 日ごとに自動更新しますか?`,
	[POPINS.FULLSCREEN.EOS.PROXY.ReproxyDesc]:() =>
		`これを有効にした場合には最初のトランザクションおよび以後のすべてのトランザクションも承諾されます。`,
	[POPINS.FULLSCREEN.EOS.PROXY.Label]:() => `Proxy`,
	[POPINS.FULLSCREEN.EOS.PROXY.Placeholder]:() => `委任投票するアカウント名を入力`,
	[POPINS.FULLSCREEN.EOS.PROXY.KnownProxiesLabel]:() => `既知の委任投票先`,
	[POPINS.FULLSCREEN.EOS.PROXY.Button]:() => `委任投票設定`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.MNEMONIC.Title]:() => `代替パスワード`,
	[POPINS.FULLSCREEN.MNEMONIC.Desc]:() => `このフレーズはパスワードのバックアップです。キーの生成には使用されません。`,
	[POPINS.FULLSCREEN.MNEMONIC.SubDesc]:() => `このフレーズを Scatter 内で要求されるすべてのパスワード入力欄に入力することが可能です。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.REMOVE_KEY.Title]:() => `キーの削除`,
	[POPINS.FULLSCREEN.REMOVE_KEY.Disclaimer]:() => `キーの削除は関連するすべてのアカウントとアプリケーションが削除されます。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.REMOVE_LOCATION.Title]:() => `場所の削除`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.UNLINK_ACCOUNT.Title]:() => `アカウントのリンク解除`,
	[POPINS.FULLSCREEN.UNLINK_ACCOUNT.Desc]:() => `アカウントのリンク解除はすべてのアプリケーションの許可設定も削除されます。`,
	[POPINS.FULLSCREEN.UNLINK_ACCOUNT.SubDesc]:() => `削除するすべて項目を選択してください。`,
	[POPINS.FULLSCREEN.UNLINK_ACCOUNT.AuthoritiesLabel]:() => `項目`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.FULLSCREEN.UNLINK_BLOCKCHAIN.Title]:() => `ブロックチェーンのリンク解除`,
	[POPINS.FULLSCREEN.UNLINK_BLOCKCHAIN.Disclaimer]:() => `ブロックチェーンのリンク解除は関連するすべてのアカウントとアプリケーション許可設定も削除されます。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.OVERLAY.ConfirmPin]:() => `PIN の確認`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.OVERLAY.REMOVE_APP.Title]:() => `アプリケーションの削除`,
	[POPINS.OVERLAY.REMOVE_APP.Desc]:() => `Scatter からこのアプリケーションを削除します。ホワイトリストされた許可設定も削除されます。`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.OVERLAY.TRX_SUCCESS.Title]:() => `トランザクション成功!`,
	[POPINS.OVERLAY.TRX_SUCCESS.Desc]:x => `下のリンクをクリックして ${x} で確認`,
	/////////////////////////////////////////////////////////////////////////////////////////////////
	[POPINS.OVERLAY.UPDATE_AVAIL.Title]:() => `Scatter のアップデート版が入手可能です`,
	[POPINS.OVERLAY.UPDATE_AVAIL.ClickLink]:() => `下のリンクをクリックしてダウンロードページへ移動`,

};

export default Locale;

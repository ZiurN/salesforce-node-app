class OAuth2 {
  constructor() {
    this.unamerDev = {
      oauth2 : {
        loginUrl : 'https://test.salesforce.com',
        clientId : '3MVG9BWMiHkoluZESNtBXhxult1O3lIL6yx.IYHU2sN3MZS2Zu0v98wv3L_ZVjKXUSWpj_6pZHITP4Renu5cZ',
        clientSecret : 'BC3319DB1F74A406AB9E685A2B8C1313BA5D407EC918BFE9E237597AB085A34B',
        redirectUri : 'https://login.salesforce.com/services/oauht2/callback'
      },
      username : 'jefferson.ruiz@emeal.nttdata.com.unhcr.amer.dev',
      password : '@ZiuR11235pHWNTf7pBlzOlfwk3jW9vWuXp'
    }
    this.unamerUAT = {
      oauth2 : {
        loginUrl : 'https://test.salesforce.com',
        clientId : '3MVG934iBBsZ.kUF.hPo3YTZdGVjlBpQwpDjA2blVB1ycrlerG1s5jgzU8bj7UDthkjl4xmYAhDqChOnJ4CM2',
        clientSecret : '7D3016E31AE2BB0491586D9B5E3B9B986C65F503466AA9CFB836FAE2A5F8CC63',
        redirectUri : 'https://login.salesforce.com/services/oauht2/callback'
      },
      username : 'jefferson.ruiz@emeal.nttdata.com.unamer.uat',
      password : 'jef123456n1uOC8SDawdJfcY8Ci6gDRpKu'
    }
    this.unhcr = {
      oauth2 : {
        loginUrl : 'https://login.salesforce.com',
        clientId : '',
        clientSecret : '',
        redirectUri : 'https://login.salesforce.com/services/oauht2/callback'
      },
      username : 'luis@emeal.nttdata.com',
      password : 'pasSword1!BBqWbuBdTNBEF1KnwMyrynZb'
    }
  }
}

export { OAuth2 }
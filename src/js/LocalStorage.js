// import axios from 'axios'
export default {
  setLocalStorage: function (type, topicID) {
    /* create new timestamp */
    let time = new Date().getTime() / 1000
    let Data = []
    /* defined data type */
    let DataType = {
      /* current time */
      time: time,
      /* delete topic id */
      id: topicID
    }
    /* get localstorage delete data */
    let localstorageDelete = JSON.parse(window.localStorage.getItem(type))
    /* if localstorage delete data is not null */
    if (localstorageDelete !== null) {
      for (let data of localstorageDelete) {
        /* only recorded for 60 seconds data */
        if (time - data.time < 60) {
          Data.push(data)
        }
      }
    }
    /* create new delete data */
    Data.push(DataType)
    /* write to localstorage */
    window.localStorage.setItem(type, JSON.stringify(Data))
  },
  GetLocalStorage: async function (type, topics) {
    let time = new Date().getTime() / 1000
    /* get localstorage delete data */
    let localstorage = await JSON.parse(window.localStorage.getItem(type))
    let TopicId = []
    /* if localstorage delete data is not null */
    if (localstorage !== null) {
      for (let data of localstorage) {
        /* check in 60 seconds data */
        if (time - data.time < 60) {
          TopicId.push(data.id)
        }
      }
    } else TopicId = []
    return TopicId
  },
  LocalStorageFilter: async function (topics) {
    // let verifyCheck = false
    let topicsFilter = []
    let temptopicid = []
    let localstorageAsk = await JSON.parse(window.localStorage.getItem('Ask'))
    /* if data in 60s */
    let AskTopicId = await this.GetLocalStorage('Ask', topics)
    let DeleteId = await this.GetLocalStorage('delete', topics)
    if (AskTopicId.length > 0) {
      /* filter AskTopicId reapt data */
      topics.filter((id, index) => {
        let verify = AskTopicId.some(function (value, index, array) { return value === id.id })
        if (!verify) { temptopicid.push(id) }
      })
      /* if no match data */
      if (temptopicid.length === 0) { temptopicid = [] }
      /*  Reorganization Data: localstorageAsk + temptopicid */
      temptopicid = (localstorageAsk.reverse()).concat(temptopicid)
      /* local storage 'Ask' data is empty */
    } else temptopicid = topics
    /* final filter delete data */
    temptopicid.filter((id, index) => {
      let deleteVerify = DeleteId.some(function (value, index, array) { return value === id.id })
      if (!deleteVerify) { topicsFilter.push(id) }
    })
    return topicsFilter
  },
  ClearLocalStorage: async function (type) {
    let time = new Date().getTime() / 1000

    /* localstorage delete data keep 60s */
    let localstorageDelete = JSON.parse(window.localStorage.getItem(type))
    /* if localstorage delete data is not null */
    if (localstorageDelete !== null) {
      let lastdelete = localstorageDelete[localstorageDelete.length - 1].time
      /* if last data over 60s remove delete */
      if (time - lastdelete > 60) {
        window.localStorage.removeItem(type)
      }
    }
  }
  // GetLocalStorageDelete: async function (type, topics) {
  //   let verifyCheck = false
  //   let topicsFilter = []
  //   /* if data in 60s */
  //   let deleteTopicId = await this.GetLocalStorage(type, topics)
  //   if (deleteTopicId.length > 0) {
  //     /* filter reapt data */
  //     topics.filter((id, index) => {
  //       let verify = deleteTopicId.some(function (value, index, array) {
  //         return value === id.id
  //       })
  //       if (!verify) {
  //         topicsFilter.push(id)
  //         verifyCheck = true
  //       }
  //       /* if Local Storagedata the same data with topics */
  //       if (topics.length - (index + 1) === 0 && verifyCheck === false) {
  //         topicsFilter = []
  //       }
  //     })
  //     /* if no match data */
  //   } else topicsFilter = topics
  //   return topicsFilter
  // }
}

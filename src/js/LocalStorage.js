// import axios from 'axios'
export default {
  // getAllTopics: function (url) {
  //   // var data
  //   // function getTopics () {
  //   //   return new Promise((resolve, reject) => {
  //   //     axios.get(url).then((val) => {
  //   //       data = val
  //   //       resolve(val)
  //   //     })
  //   //   })
  //   // }
  //   // let data1 = getTopics()
  //   // console.log(data)
  //   // return data1
  //   function getTopics () {
  //     var str
  //     str = axios.get(url)
  //     .then(function (response) {
  //       return response
  //       // console.log(response);
  //     })
  //     .catch(function (error) {
  //       console.log(error)
  //     })
  //     return str
  //   }
  //   return getTopics()
  // },
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
  getLocalStorage: async function (type, topics) {
    let verifyCheck = false
    let topicsFilter = []
    let time = new Date().getTime() / 1000
    /* get localstorage delete data */
    let localstorageDelete = await JSON.parse(window.localStorage.getItem(type))
    let deleteTopicId = []
    /* if localstorage delete data is not null */
    if (localstorageDelete !== null) {
      for (let data of localstorageDelete) {
        /* check in 60 seconds data */
        if (time - data.time < 60) {
          deleteTopicId.push(data.id)
        }
      }
    }

    /* if data in 60s */
    if (deleteTopicId.length > 0) {
      /* filter reapt data */
      topics.filter((id, index) => {
        let verify = deleteTopicId.some(function (value, index, array) {
          return value === id.id
        })
        if (!verify) {
          topicsFilter.push(id)
          verifyCheck = true
        }
        /* if Local Storagedata the same data with topics */
        if (topics.length - (index + 1) === 0 && verifyCheck === false) {
          topicsFilter = 'AlltheSame'
        }
      })
    } else topicsFilter = topics

    if (type === 'Ask' && deleteTopicId.length > 0) {
      if (topicsFilter === 'AlltheSame') {
        topicsFilter = (localstorageDelete.reverse())
      } else {
        let temp = topicsFilter
        topicsFilter = (localstorageDelete.reverse()).concat(temp)
      }
    }
    // console.log(topicsFilter)
    return topicsFilter
  }
}

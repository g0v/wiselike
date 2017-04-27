import axios from 'axios'
export default {
  getAllTopics: function (url) {
    // var data
    // function getTopics () {
    //   return new Promise((resolve, reject) => {
    //     axios.get(url).then((val) => {
    //       data = val
    //       resolve(val)
    //     })
    //   })
    // }
    // let data1 = getTopics()
    // console.log(data)
    // return data1
    function getTopics () {
      var str
      str = axios.get(url)
      .then(function (response) {
        return response
        // console.log(response);
      })
      .catch(function (error) {
        console.log(error)
      })
      return str
    }
    return getTopics()
  }
}

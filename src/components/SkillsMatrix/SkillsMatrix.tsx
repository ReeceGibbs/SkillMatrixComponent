import React from 'react';
import { ICategory } from '../../models/ICategory';
import styles from './SkillsMatrix.module.scss';

//our props and state definitions
interface SkillsMatrixProps {
  value: any;
}

interface SkillsMatrixState {
  error: any;
  isLoaded: boolean;
  categories: ICategory;
}

class SkillsMatrix extends React.Component<SkillsMatrixProps, SkillsMatrixState> {

  constructor(props: any) {

    super(props);

    this.state = {
      error: null,
      isLoaded: false,
      categories: {
        name: '',
        children: Array<ICategory>(),
        id: 0,
      }
    };
  }

  //we implement the componentDidMount function and make our AJAX call to our endpoint from here
  componentDidMount() {

    this.getCategories();
  }

  //an async function that we can call to grab the categories from our endpoint
  async getCategories() {

    let error = null;

    //we hit our endpoint here and handle the response
    const categories: ICategory = await fetch('https://us-central1-skillsmatrix.cloudfunctions.net/api/categories')
      .then(res => {
        
        return res.json();
      })
      .catch(err => {

        error = err;
      });

      //we set our state here so that we can reference the values returned from our function when we render the component
      this.setState({
        error: error,
        isLoaded: true,
        categories: categories,
      });
  }

  render() {

    const categories: ICategory = this.state.categories;

    return (
      <h1 className={styles.skills_header}>{this.state.isLoaded ? categories.name : 'loading...'}</h1>
    );
  }
}

export default SkillsMatrix;

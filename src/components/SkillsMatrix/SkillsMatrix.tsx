import { ChevronRight, ExpandMore, ScoreSharp } from '@mui/icons-material';
import { TreeItem, TreeView } from '@mui/lab';
import { Box, Container, Grid, LinearProgress, Typography } from '@mui/material';
import React, { SyntheticEvent } from 'react';
import { createNull } from 'typescript';
import { ICategory, SkillDictionaryItem } from '../../models/ICategory';
import { IUser } from '../../models/IUser';

//our props and state definitions
interface SkillsMatrixProps {
  value: any;
}

interface SkillsMatrixState {
  error: any;
  isLoaded: boolean;
  users: Array<IUser>;
  filteredUsers: Array<IUser>
  categories: ICategory;
  skillDictionary: Array<SkillDictionaryItem>;
}

class SkillsMatrix extends React.Component<SkillsMatrixProps, SkillsMatrixState> {

  constructor(props: any) {

    super(props);

    this.state = {
      error: null,
      isLoaded: false,
      users: Array<IUser>(),
      filteredUsers: Array<IUser>(),
      categories: {
        name: '',
        children: Array<ICategory>(),
        id: 0,
      },
      skillDictionary: Array<SkillDictionaryItem>(),
    };
  }

  //we implement the componentDidMount function and make our AJAX call to our endpoint from here
  componentDidMount() {

    this.getCategories();

    this.getUsers();
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
        skillDictionary: Array<SkillDictionaryItem>(),
      });
  }

  //an async function that retrieves a list of users from the SkillsMatrix endpoint
  async getUsers() {

    let error = null;

    const users: Array<IUser> = await fetch('https://us-central1-skillsmatrix.cloudfunctions.net/api/users')
      .then(res => {

        return res.json();
      })
      .catch(err => {

        error = err;
      });

      this.setState({
        error: error,
        isLoaded: true,
        users: users,
        filteredUsers: users,
      });
  }

  //a recursive function that we can use to build our tree view
  buildCategoryView(categoryObject: ICategory) {

    //if the category object has children then we want to return a TreeItem with the relevant content and call this function again to see if we have gotten to the end of the recursive list
    if (categoryObject.children) {

      return (
        categoryObject.children.map(categoryChild => {

          return (
  
            <TreeItem nodeId={categoryChild.id.toString()} label={categoryChild.name}>
              {this.buildCategoryView(categoryChild)}
            </TreeItem>
          );
        })
      );
    }
    else {

      //if this category object does not have children, it means we have reached an actual skill metric, so we must add it to our dictionary
      this.state.skillDictionary.push(categoryObject);

      return null;
    }
  }

  //a function that will be used to get a list of users
  buildUserView(users: Array<IUser>, skillDictionary: Array<SkillDictionaryItem>) {

    //we want to order our users' scores by how good they are
    users.forEach(user => {

      if (user.scores) {

        user.scores.sort((first, second) => (first.score < second.score) ? 1 : -1);
      }
    });

    return ( 
      users.map( (user, index) => {

        return (

          <TreeItem nodeId={index.toString()} label={`${user.firstName} ${user.lastName}`}>
            <TreeItem nodeId={`fn_${index.toString()}`} label={`First name: ${user.firstName}`} />
            <TreeItem nodeId={`ln_${index.toString()}`} label={`Last name: ${user.lastName}`} />
            <TreeItem nodeId={`em_${index.toString()}`} label={`Email: ${user.email}`} />
            <TreeItem nodeId={`ac_${index.toString()}`} label={`Active: ${user.isActive ? 'True' : 'False'}`} />
            {user.scores ? (
              <TreeItem nodeId={`scores_${index.toString()}`} label='Skills'>
                {
                  user.scores.map( (score, scoreIndex) => {

                    return (

                      score.score > 0 ?
                        <TreeItem 
                          nodeId={`category_${scoreIndex.toString()}`} 
                          label={`${(skillDictionary.find(skill => skill.id === score.category_id)?.name)} - ${score.score}`}
                        /> :
                        null                        
                    );
                  })
                }
              </TreeItem>
             ) : null
            }
          </TreeItem>
        );
      })
    );
  }

  filterUsers(users: Array<IUser>, skillDictionary: Array<SkillDictionaryItem>, nodeId: string) {

    if (skillDictionary.filter(skill => skill.id.toString() === nodeId).length > 0) {

      const filteredUsers = users.filter(user => user.scores.filter(skill => skill.category_id.toString() === nodeId).length > 0);

      this.setState({
        filteredUsers: filteredUsers,
      })
    } 
    else {
      
      this.setState({
        filteredUsers: users,
      });
    }
  }

  checkLoaded(isLoaded: boolean, categoryView: JSX.Element[] | null, userView: JSX.Element[] | null) {

    return (isLoaded && categoryView && userView && categoryView.length > 0 && userView.length > 0);
  }

  render() {

    const categories: ICategory = this.state.categories;

    const users: Array<IUser> = this.state.users;

    const filteredUsers: Array<IUser> = this.state.filteredUsers;

    const skillDictionary: Array<SkillDictionaryItem> = this.state.skillDictionary;

    const categoryView: JSX.Element[] | null = this.buildCategoryView(categories);

    const userView: JSX.Element[] | null = this.buildUserView(filteredUsers, skillDictionary);

    return (
      <Container maxWidth='md'>
        {
          this.checkLoaded(this.state.isLoaded, categoryView, userView)  ? (
            <Grid container spacing={2}>
              <Grid item md={6}>
                <Typography 
                  variant='h2'
                  sx = {{ color: '#3f51b5' }}
                >
                  Skills
                </Typography>
                <TreeView
                  aria-label='category-tree'
                  defaultCollapseIcon={<ExpandMore />}
                  defaultExpandIcon={<ChevronRight />}
                  onNodeSelect={(event: SyntheticEvent, nodeId: string) => this.filterUsers(users, skillDictionary, nodeId)}
                >
                  {categoryView}
                </TreeView>
              </Grid>
              <Grid item lg={6}>
                <Typography 
                  variant='h2'
                  sx = {{ color: '#3f51b5' }}
                >
                  Users
                </Typography>
                <TreeView
                  aria-label='users-tree'
                  defaultCollapseIcon={<ExpandMore />}
                  defaultExpandIcon={<ChevronRight />}
                  multiSelect
                >
                  {userView}
                </TreeView>
              </Grid>
            </Grid>
          ) :
          (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          )
        }
      </Container>
    );
  }
}

export default SkillsMatrix;

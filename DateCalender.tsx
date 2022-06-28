import {
  FlatList,
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import * as React from 'react';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Colors, Metrics} from '../../Themes';
import {Table, TableWrapper, Cell, Row} from 'react-native-table-component';
import Icon from 'react-native-vector-icons/AntDesign';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {If, Then} from 'react-if';

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const months = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

const days = ['SUN', 'MON', 'TUS', 'WED', 'THU', 'FRI', 'SAT'];

const nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type DateCalenderProps = {
  SelectDate(date: string): void;
  DateHint: string;
  paddingVertical: number;
};

const DateCalender = (props: DateCalenderProps) => {
  const {SelectDate, DateHint = 'DOB', paddingVertical = 12} = props;
  const [date, setDate] = React.useState(DateHint);
  const [display, setDisplay] = React.useState(false);
  const MAX_SLIDE_OFFSET = 180 * 0.3;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const activeDate = new Date();
  const monthIndex = activeDate.getMonth();
  const [count, setCount] = React.useState(monthIndex);
  const [year, setYear] = React.useState(activeDate.getFullYear());
  const [userSelect, setUserSelect] = React.useState(0);
  const [showY, setShowY] = React.useState(false);
  const [metrix, setmetrix] = React.useState([]);

  const incrementCount = React.useCallback(() => {
    setCount((currentCount) =>
      currentCount >= 0 && currentCount <= 10 ? currentCount + 1 : currentCount,
    );
  }, []);

  const decreaseCount = React.useCallback(() => {
    setCount((currentCount) =>
      currentCount > 0 && currentCount <= 11 ? currentCount - 1 : currentCount,
    );
  }, []);

  const resetCount = React.useCallback(() => {
    setCount(0);
  }, []);

  const generateMatrix = () => {
    var matrix = [];
    // Create header
    matrix[0] = days;
    // var year = activeDate.getFullYear();
    // var month = activeDate.getMonth();
    var maxDays = nDays[count];
    var counter = 1;
    var firstDay = new Date(year, count, 1).getDay();

    if (count == 1) {
      // February
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        maxDays += 1;
      }
    }

    for (var row = 1; row < 7; row++) {
      matrix[row] = [];
      for (var col = 0; col < 7; col++) {
        matrix[row][col] = -1;
        if (row == 1 && col >= firstDay) {
          matrix[row][col] = counter++;
        } else if (row > 1 && counter <= maxDays) {
          matrix[row][col] = counter++;
        }
      }
    }
    return matrix;
  };

  const onGesterHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onActive: (event) => {
        translateX.value = clamp(
          event.translationX,
          -MAX_SLIDE_OFFSET,
          MAX_SLIDE_OFFSET,
        );
        translateY.value = clamp(
          event.translationY,
          -MAX_SLIDE_OFFSET,
          MAX_SLIDE_OFFSET,
        );
      },

      onEnd: () => {
        if (translateX.value === MAX_SLIDE_OFFSET) {
          runOnJS(incrementCount)();
        } else if (translateX.value === -MAX_SLIDE_OFFSET) {
          runOnJS(decreaseCount)();
        } else if (translateY.value === MAX_SLIDE_OFFSET) {
          runOnJS(resetCount)();
        }
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      },
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: translateX.value},
        {translateY: translateY.value},
      ],
    };
  }, []);

  const closeIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [0, 180 * 0.3], [0, 0.8]);
    return {opacity};
  });

  React.useEffect(() => {
    setmetrix(generateMatrix());
    setUserSelect(1);
  }, [count, year]);

  const element = (data, type) => (
    <TouchableOpacity
      activeOpacity={typeof data === 'number' ? 0 : 1}
      onPress={() => {
        if (typeof data === 'number') {
          setUserSelect(data);
        }
      }}>
      <View>
        <Text
          style={[
            type === 0 || type === 1 ? style.selectDate : style.commanDate,
            {
              backgroundColor:
                type === 0 ? Colors.white : type === 1 ? Colors.primary : null,
              color: type === 0 ? Colors.primary : Colors.white,
            },
          ]}>
          {data}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
          setDisplay(true);
          Keyboard.dismiss();
        }}
        style={[style.CardStyle, {paddingVertical: paddingVertical}]}>
        <Text
          style={{
            color:
              date === 'DOB' || date === 'Date Of Birth'
                ? Colors.normalTextColor
                : Colors.black,
          }}>
          {date}
        </Text>
      </TouchableOpacity>

      <View style={[style.calender, {display: display ? 'flex' : 'none'}]}>
        <View style={{width: Metrics.screenWidth * 0.8}}>
          <View style={{flexDirection: 'row'}}>
            <View style={style.months}>
              <Icon name="doubleleft" style={{color: 'white', fontSize: 15}} />
              <Animated.View style={closeIconStyle}>
                <Icon name="close" style={{color: 'white', fontSize: 15}} />
              </Animated.View>
              <Icon name="doubleright" style={{color: 'white', fontSize: 15}} />
              <View style={style.monthtext}>
                <PanGestureHandler onGestureEvent={onGesterHandler}>
                  <Animated.View style={[style.circle, rStyle]}>
                    <Text style={style.text}>
                      {months[count]}{' '}
                      {monthIndex === count ? (
                        <Text style={{color: Colors.primary}}>{'\u2B24'}</Text>
                      ) : null}
                    </Text>
                  </Animated.View>
                </PanGestureHandler>
              </View>
            </View>

            <View style={[style.year, {height: showY ? 250 : 45}]}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: showY ? 250 : 45,
                  position: 'relative',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowY(!showY);
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut,
                    );
                  }}>
                  <Text style={[style.text, {padding: 10}]}>{year}</Text>
                </TouchableOpacity>
                <If condition={showY}>
                  <Then>
                    <View style={style.yearlist}>
                      <FlatList
                        style={{position: 'relative', paddingVertical: 10}}
                        data={Array.from(
                          new Array(82),
                          (val, index) => activeDate.getFullYear() - 18 - index,
                        ).sort()}
                        renderItem={({item}) => (
                          <TouchableOpacity
                            style={{marginHorizontal: 5, position: 'relative'}}
                            onPress={() => {
                              setYear(item);
                              setShowY(false);
                              LayoutAnimation.configureNext(
                                LayoutAnimation.Presets.easeInEaseOut,
                              );
                            }}>
                            <Text
                              style={{
                                color: Colors.white,
                                fontSize: 13,
                                textAlign: 'center',
                                position: 'relative',
                                paddingVertical: 10,
                              }}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </Then>
                </If>
              </View>
            </View>
          </View>
          <View style={style.date}>
            <Table>
              <FlatList
                data={metrix}
                renderItem={({item, index}) => {
                  return (
                    <TableWrapper key={index} style={{flexDirection: 'row'}}>
                      {item.map((cellData, cellIndex) => (
                        <Cell
                          key={cellIndex}
                          data={
                            cellData === userSelect
                              ? element(cellData, 0)
                              : activeDate.getDate() === cellData &&
                                count === monthIndex &&
                                year === activeDate.getFullYear()
                              ? element(cellData, 1)
                              : cellData === -1
                              ? ''
                              : element(cellData, 2)
                          }
                        />
                      ))}
                    </TableWrapper>
                  );
                }}
              />
            </Table>
          </View>
        </View>

        <View style={style.pnbtnContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setDisplay(false);
            }}>
            <Text
              style={[
                style.pnBtn,
                {backgroundColor: Colors.white, color: Colors.black},
              ]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              SelectDate(`${userSelect}/${count + 1}/${year}`);
              setDate(`${userSelect}/${count + 1}/${year}`);
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setDisplay(false);
            }}>
            <Text
              style={[
                style.pnBtn,
                {backgroundColor: Colors.primary, color: Colors.white},
              ]}>
              Ok
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  pnbtnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 8,
    width: '100%',
  },
  pnBtn: {
    color: Colors.primary,
    fontSize: 12,
    marginVertical: 5,
    fontWeight: 'bold',
    marginHorizontal: 5,
    marginTop: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 30,
    borderRadius: 5,
    width: 80,
    shadowColor: '#ffffff',
    elevation: 3,
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 3,
  },
  CardStyle: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderColor: '#D9E2E8',
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    elevation: 3,
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  commanDate: {
    marginVertical: 1,
    paddingVertical: 5,
    fontSize: 12,
    color: Colors.white,
    alignSelf: 'center',
    alignItems: 'center',
  },
  selectDate: {
    borderRadius: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    fontSize: 12,
    width: 25,
    height: 25,
  },
  yearlist: {
    height: 250,
    width: 100,
    backgroundColor: '#232323',
    position: 'absolute',
    borderRadius: 15,
  },
  calender: {
    width: Metrics.screenWidth * 0.9,
    alignSelf: 'center',
    position: 'relative',
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 10,
    backgroundColor: 'rgba(37, 40, 43, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthtext: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    height: 200,
    width: 'auto',
    backgroundColor: '#111111',
    marginTop: 10,
    borderRadius: 15,
    zIndex: -1,
    shadowColor: '#ffffff',
    elevation: 8,
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 3,
  },
  year: {
    width: 100,
    backgroundColor: '#111111',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#ffffff',
    elevation: 8,
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 3,
    position: 'absolute',
    right: 0,
  },
  months: {
    height: 45,
    width: 180,
    backgroundColor: '#111111',
    borderRadius: 15,
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    marginRight: 20,
    flexDirection: 'row',
    shadowColor: '#ffffff',
    elevation: 8,
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 3,
  },
  text: {
    fontSize: 12,
    color: Colors.white,
  },
  circle: {
    height: 30,
    width: 90,
    backgroundColor: '#232323',
    borderRadius: 25,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    elevation: 8,
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 3,
  },
  close: {
    width: 25,
    height: 25,
    padding: 5,
    alignSelf: 'flex-end',
    marginVertical: 5,
    backgroundColor: Colors.white,
    borderRadius: 15,
    fontSize: 15,
  },
});

export default DateCalender;
